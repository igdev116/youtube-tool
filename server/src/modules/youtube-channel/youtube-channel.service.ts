import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery, Types } from 'mongoose';
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
import { UserService } from '../../user/user.service';
import { TelegramBotService } from '../../telegram/telegram-bot.service';
import pLimit from 'p-limit';
import { TelegramQueueService } from '../queue/telegram-queue.service';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class YoutubeChannelService {
  private readonly logger = new Logger(YoutubeChannelService.name);

  constructor(
    @InjectModel(YoutubeChannel.name)
    private readonly channelModel: Model<YoutubeChannelDocument>,
    private readonly userService: UserService,
    private readonly telegramBotService: TelegramBotService,
    private readonly telegramQueueService: TelegramQueueService,
  ) {}

  private getUserIdFromRef(userRef: Types.ObjectId | any): string {
    if (userRef && typeof userRef === 'object') {
      if ('_id' in userRef && userRef._id) {
        return String(userRef._id);
      }
      if (typeof userRef.toString === 'function') {
        return userRef.toString();
      }
    }
    return String(userRef);
  }

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

  async testCheckNewVideo() {
    return await this.notifyAllChannelsNewVideo();
  }

  async notifyAllChannelsNewVideo() {
    const activeChannels = await this.channelModel
      .find({ isActive: true })
      .populate('user')
      .exec();

    const tasks = activeChannels.map(async (channel) => {
      const userIdKey = this.getUserIdFromRef(channel.user);
      try {
        const latestVideo = await extractFirstVideoFromYt(channel.xmlChannelId);
        if (!latestVideo) return;

        const isNewByTime = !channel.lastVideoAt
          ? true
          : dayjs(latestVideo.publishedAt).isAfter(dayjs(channel.lastVideoAt));

        if (isNewByTime) {
          let telegramGroupId: string | undefined;
          const user = channel.user as any;
          if (user && 'telegramGroupId' in user) {
            telegramGroupId = user.telegramGroupId;
          }

          const updatedChannel = await this.channelModel.findOneAndUpdate(
            { _id: channel._id },
            {
              $set: {
                lastVideoId: latestVideo.id,
                lastVideoAt: dayjs
                  .utc(latestVideo.publishedAt)
                  .tz('Asia/Ho_Chi_Minh')
                  .toDate(),
              },
            },
            { new: true },
          );

          if (updatedChannel && telegramGroupId) {
            await this.telegramQueueService.addTelegramMessageJob({
              groupId: telegramGroupId,
              video: {
                title: latestVideo.title || '',
                url: `https://www.youtube.com/watch?v=${latestVideo.id}`,
                thumbnail: latestVideo.thumbnail,
                channelId: channel.channelId,
                jobId: `${channel.channelId}/${latestVideo.id}/${userIdKey}`,
                publishedAt: updatedChannel.lastVideoAt.toISOString(),
              },
            });
          }
        }
      } catch (error) {
        const err = error as Error;
        console.log('error :', err.message);
        await this.addChannelError(channel, ChannelErrorType.NETWORK_ERROR);
      }
    });

    await Promise.all(tasks);
  }
}
