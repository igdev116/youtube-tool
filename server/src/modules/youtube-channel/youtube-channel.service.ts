import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery, Types } from 'mongoose';
import {
  YoutubeChannel,
  YoutubeChannelDocument,
  ChannelErrorType,
  YoutubeChannelSort,
} from './youtube-channel.schema';
import {
  extractXmlChannelIdFromUrl,
  extractChannelDataFromUrl,
} from './youtube-channel.utils';
import { BulkChannelDto } from './dto/bulk-channel.dto';
import { paginateWithPage } from '../../utils/pagination.util';
import { extractFirstVideoFromYt } from './youtube-channel.utils';
import pLimit from 'p-limit';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { YoutubeWebsubService } from '../websub/youtube-websub.service';
import { UserService } from '../../user/user.service';
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
    private readonly userService: UserService,
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
        const channelResult = await extractChannelDataFromUrl(item.link);
        if (!channelResult) {
          return;
        }

        const { channelId, avatarId } = channelResult;

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
          // Sử dụng avatarId từ channel metadata
          await this.channelModel.create({
            channelId,
            xmlChannelId,
            avatarId,
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
          const callbackUrl = `${process.env.API_URL}/websub/youtube/callback`;
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
    sortKey?: YoutubeChannelSort,
    favoriteOnly?: boolean,
  ) {
    const filter: FilterQuery<YoutubeChannelDocument> = { user: userId };
    if (keyword) {
      filter.channelId = { $regex: keyword, $options: 'i' } as any;
    }
    if (favoriteOnly) {
      const favoriteIds = await this.userService.getFavoriteChannels(userId);
      const validObjectIds = (favoriteIds || [])
        .filter((id: string) => Types.ObjectId.isValid(id))
        .map((id: string) => new Types.ObjectId(id));
      if (validObjectIds.length === 0) {
        return paginateWithPage<YoutubeChannelDocument>(
          this.channelModel,
          { _id: { $in: [] } } as any,
          page,
          limit,
          this.mapSort(sortKey),
        );
      }
      (filter as any)._id = { $in: validObjectIds } as any;
    }
    // sort mapping
    const sort: Record<string, 1 | -1> = this.mapSort(sortKey);
    return paginateWithPage<YoutubeChannelDocument>(
      this.channelModel,
      filter,
      page,
      limit,
      sort,
    );
  }

  private mapSort(sortKey?: YoutubeChannelSort): Record<string, 1 | -1> {
    switch (sortKey) {
      case YoutubeChannelSort.NEWEST_UPLOAD:
        return { lastVideoAt: -1, _id: -1 };
      case YoutubeChannelSort.OLDEST_CHANNEL:
        return { _id: 1 };
      case YoutubeChannelSort.NEWEST_CHANNEL:
      default:
        return { _id: -1 };
    }
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
          const callbackUrl = `${process.env.API_URL}/websub/youtube/callback`;
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

  async deleteAllUserChannels(userId: string) {
    // Lấy danh sách xmlChannelId trước khi xoá để xử lý unsubscribe nếu cần
    const userChannels = await this.channelModel
      .find({ user: userId }, { xmlChannelId: 1 })
      .lean()
      .exec();
    const xmlIds = Array.from(
      new Set(
        (userChannels || []).map((c: any) => c.xmlChannelId).filter(Boolean),
      ),
    );

    const result = await this.channelModel.deleteMany({ user: userId });

    // Với mỗi xmlChannelId, nếu không còn ai theo dõi nữa thì unsubscribe
    for (const xmlId of xmlIds) {
      try {
        const remaining = await this.channelModel.countDocuments({
          xmlChannelId: xmlId,
        });
        if (remaining === 0) {
          const topicUrl = `${YT_FEED_BASE}?channel_id=${xmlId}`;
          const callbackUrl = `${process.env.API_URL}/websub/youtube/callback`;
          await this.websubService.unsubscribeCallback(topicUrl, callbackUrl);
        }
      } catch {
        // ignore
      }
    }

    return { deletedCount: result.deletedCount ?? 0 };
  }

  async getAllUserChannels(
    userId: string,
    keyword?: string,
    sortKey?: YoutubeChannelSort,
    favoriteOnly?: boolean,
  ) {
    const filter: FilterQuery<YoutubeChannelDocument> = { user: userId };
    if (keyword) {
      filter.channelId = { $regex: keyword, $options: 'i' } as any;
    }
    if (favoriteOnly) {
      const favoriteIds = await this.userService.getFavoriteChannels(userId);
      const validObjectIds = (favoriteIds || [])
        .filter((id: string) => Types.ObjectId.isValid(id))
        .map((id: string) => new Types.ObjectId(id));
      if (validObjectIds.length === 0) {
        return [] as YoutubeChannelDocument[];
      }
      (filter as any)._id = { $in: validObjectIds } as any;
    }

    const sort: Record<string, 1 | -1> = this.mapSort(sortKey);
    return this.channelModel.find(filter).sort(sort).lean().exec();
  }
}
