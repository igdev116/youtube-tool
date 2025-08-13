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

  async addChannelsBulk(channels: BulkChannelDto[], userId: string) {
    const errorLinks: { link: string; reason: string }[] = [];
    const docs: YoutubeChannelDocument[] = [];
    const limit = pLimit(5);

    const tasks = channels.map((item) =>
      limit(async () => {
        const xmlChannelId = await extractXmlChannelIdFromUrl(item.link);
        if (!xmlChannelId) {
          errorLinks.push({ link: item.link, reason: 'không hợp lệ' });
          return;
        }
        const channelId = await extractChannelIdFromUrl(item.link);

        const existingChannel = await this.channelModel.findOne({
          channelId,
          user: userId,
        });
        if (existingChannel) {
          errorLinks.push({ link: item.link, reason: 'đã tồn tại' });
          return;
        }

        try {
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
            // ignore
          }

          const doc = await this.channelModel.create({
            channelId,
            xmlChannelId,
            isActive: item.isActive ?? true,
            user: userId,
            ...(latestVideoId
              ? {
                  lastVideoId: latestVideoId,
                  lastVideoAt: latestPublishedAtDate ?? new Date(),
                }
              : {}),
          });
          docs.push(doc);

          // Subscribe WebSub ngay sau khi tạo
          const topicUrl = `${YT_FEED_BASE}?channel_id=${xmlChannelId}`;
          const callbackUrl = `${process.env.APP_URL}/websub/youtube/callback`;
          void this.websubService.subscribeCallback(topicUrl, callbackUrl);
        } catch {
          errorLinks.push({ link: item.link, reason: 'lỗi khi lưu vào DB' });
        }
      }),
    );

    await Promise.all(tasks);

    let message = '';
    if (errorLinks.length > 0) {
      message = errorLinks.map((e) => `Link ${e.link} ${e.reason}`).join(', ');
    }
    return { error: errorLinks.length > 0, message, docs };
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
