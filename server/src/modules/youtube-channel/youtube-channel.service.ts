import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import {
  YoutubeChannel,
  YoutubeChannelDocument,
  ChannelErrorType,
} from './youtube-channel.schema';
import {
  extractXmlChannelIdFromUrl,
  extractChannelIdFromUrl,
} from './youtube-channel.utils';
import { BulkChannelDto } from './dto/bulk-channel.dto';
import { paginateWithPage } from '../../utils/pagination.util';
import { extractFirstVideoFromYt } from './youtube-channel.utils';
import pLimit from 'p-limit';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { YoutubeWebsubService } from '../websub/youtube-websub.service';
import { YT_FEED_BASE } from '../../constants';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class YoutubeChannelService {
  private readonly logger = new Logger(YoutubeChannelService.name);

  constructor(
    @InjectModel(YoutubeChannel.name)
    private readonly channelModel: Model<YoutubeChannelDocument>,
    private readonly websubService: YoutubeWebsubService,
  ) {}

  private async addChannelError(
    channel: YoutubeChannelDocument,
    errorType: ChannelErrorType,
  ) {
    const updateData: UpdateQuery<YoutubeChannelDocument> = {};
    const currentErrors = channel.errors || [];
    if (!currentErrors.includes(errorType)) {
      updateData.$addToSet = { errors: errorType } as any;
    }
    if (errorType === ChannelErrorType.LINK_ERROR) {
      (updateData as any).isActive = false;
    }
    if (Object.keys(updateData).length > 0) {
      await this.channelModel.updateOne(
        { _id: channel._id } as FilterQuery<YoutubeChannelDocument>,
        updateData,
      );
    }
  }

  // Không cần await vì xử lý nền; để tránh cảnh báo linter cho async không await, giữ nguyên dạng sync
  addChannelsBulk(channels: BulkChannelDto[], userId: string) {
    // Đẩy xử lý sang nền để tránh timeout/giới hạn tài nguyên (Render)
    setTimeout(() => {
      void this.processChannelsBulk(channels, userId).catch(() => undefined);
    }, 0);
    return {
      error: false,
      message: 'Đã nhận danh sách, hệ thống sẽ xử lý nền',
      docs: [],
    };
  }

  private async processChannelsBulk(
    channels: BulkChannelDto[],
    userId: string,
  ) {
    const maxConcurrency = Number(process.env.BULK_CONCURRENCY || 3);
    const limit = pLimit(Math.max(1, maxConcurrency));

    const tasks = channels.map((item) =>
      limit(async () => {
        const xmlChannelId = await extractXmlChannelIdFromUrl(item.link);
        if (!xmlChannelId) {
          return;
        }
        const channelId = await extractChannelIdFromUrl(item.link);

        const existingChannel = await this.channelModel.findOne({
          channelId,
          user: userId,
        });
        if (existingChannel) {
          return;
        }

        let latestVideoId: string | undefined;
        let latestPublishedAtDate: Date | undefined;
        try {
          const latestVideo = await extractFirstVideoFromYt(xmlChannelId);
          if (latestVideo && latestVideo.id) {
            latestVideoId = latestVideo.id;
            latestPublishedAtDate = latestVideo.publishedAt
              ? dayjs
                  .utc(latestVideo.publishedAt)
                  .tz('Asia/Ho_Chi_Minh')
                  .toDate()
              : undefined;
          }
        } catch {
          // ignore rss error
        }

        try {
          await this.channelModel.create({
            channelId,
            xmlChannelId,
            isActive: item.isActive ?? true,
            user: userId,
            ...(latestVideoId
              ? {
                  lastVideoId: latestVideoId,
                  lastVideoAt: latestPublishedAtDate ?? new Date(),
                }
              : {
                  // Fallback để thoả điều kiện required nếu RSS tạm thời lỗi
                  lastVideoId: 'INIT',
                  lastVideoAt: new Date(0),
                }),
          });

          const topicUrl = `${YT_FEED_BASE}?channel_id=${xmlChannelId}`;
          const callbackUrl = `${process.env.APP_URL}/websub/youtube/callback`;
          await this.websubService.subscribeCallback(topicUrl, callbackUrl);
        } catch {
          // ignore create/subscribe error
        }
      }),
    );

    await Promise.all(tasks);
  }

  async getUserChannelsWithPagination(
    userId: string,
    page: number,
    limit: number,
    keyword?: string,
  ) {
    const filter: FilterQuery<YoutubeChannelDocument> = { user: userId };
    if (keyword) {
      filter.channelId = { $regex: keyword, $options: 'i' } as any;
    }
    return paginateWithPage<YoutubeChannelDocument>(
      this.channelModel,
      filter,
      page,
      limit,
      { _id: 1 },
    );
  }

  async deleteChannelById(userId: string, id: string) {
    const deleted = await this.channelModel.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (deleted) {
      try {
        const remaining = await this.channelModel.countDocuments({
          xmlChannelId: deleted.xmlChannelId,
        });
        if (remaining === 0) {
          const topicUrl = `${YT_FEED_BASE}?channel_id=${deleted.xmlChannelId}`;
          const callbackUrl = `${process.env.APP_URL}/websub/youtube/callback`;
          await this.websubService.unsubscribeCallback(topicUrl, callbackUrl);
        }
      } catch {
        // ignore unsubscribe errors
      }
    }

    return deleted;
  }

  async toggleChannelActive(userId: string, id: string) {
    const channel = await this.channelModel.findOne({
      _id: id,
      user: userId,
    });

    if (!channel) {
      return null;
    }

    channel.isActive = !channel.isActive;
    await channel.save();

    return channel;
  }
}
