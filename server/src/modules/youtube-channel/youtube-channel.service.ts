import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery, Types } from 'mongoose';
import {
  YoutubeChannel,
  YoutubeChannelDocument,
  ChannelErrorType,
} from './youtube-channel.schema';
import { extractChannelIdFromUrl } from './youtube-channel.utils';
import { BulkChannelDto } from './dto/bulk-channel.dto';
import { paginateWithPage } from '../../utils/pagination.util';
import { extractFirstVideoIdFromYt } from './youtube-channel.utils';
import { UserService } from '../../user/user.service';
import { TelegramBotService } from '../../telegram/telegram-bot.service';
import pLimit from 'p-limit';
import { TelegramQueueService } from '../queue/telegram-queue.service';

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

  /**
   * Lấy userId từ ref có thể là ObjectId hoặc document đã populate
   */
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

  /**
   * Thêm lỗi vào channel và toggle isActive thành false nếu cần
   */
  private async addChannelError(
    channel: YoutubeChannelDocument,
    errorType: ChannelErrorType,
  ) {
    const updateData: UpdateQuery<YoutubeChannelDocument> = {};

    // Chỉ thêm lỗi nếu chưa có
    const currentErrors = channel.errors || [];
    if (!currentErrors.includes(errorType)) {
      updateData.$addToSet = { errors: errorType } as any;
    }

    // Nếu là LINK_ERROR, toggle isActive thành false
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

  /**
   * Nhận mảng object { link, isActive, userId }, extract channelId, kiểm tra hợp lệ, nếu có lỗi trả về message, nếu hợp lệ mới lưu vào DB
   */
  async addChannelsBulk(channels: BulkChannelDto[], userId: string) {
    const errorLinks: { link: string; reason: string }[] = [];
    const docs: YoutubeChannelDocument[] = [];
    // const limit = pLimit(5); // Giới hạn 5 promise song song
    const tasks = channels.map((item) => async () => {
      const channelId = await extractChannelIdFromUrl(item.link);
      if (!channelId) {
        errorLinks.push({ link: item.link, reason: 'không hợp lệ' });
        return;
      }

      // Kiểm tra xem channelId đã tồn tại với user này chưa
      const existingChannel = await this.channelModel.findOne({
        channelId,
        user: userId,
      });

      if (existingChannel) {
        errorLinks.push({ link: item.link, reason: 'đã tồn tại' });
        return;
      }

      try {
        const doc = await this.channelModel.create({
          channelId,
          isActive: item.isActive ?? true,
          user: userId,
        });
        docs.push(doc);
      } catch {
        errorLinks.push({ link: item.link, reason: 'lỗi khi lưu vào DB' });
      }
    });
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

  /**
   * Kiểm tra ngay 1 kênh có video mới không, trả về thông tin video mới nếu có
   */
  async testCheckNewVideo() {
    return await this.notifyAllChannelsNewVideo();
  }

  async notifyAllChannelsNewVideo() {
    // console.log('🔔 Bắt đầu kiểm tra video mới cho tất cả kênh');

    const activeChannels = await this.channelModel
      .find({ isActive: true })
      .populate('user')
      .exec();

    const limit = pLimit(5); // Giảm từ 5 xuống 3 để tránh quá tải

    const tasks = activeChannels.map((channel) =>
      limit(async () => {
        const userIdKey = this.getUserIdFromRef(channel.user);

        try {
          const url = `https://www.youtube.com/${channel.channelId}`;
          const latestVideo = await extractFirstVideoIdFromYt(url);

          if (latestVideo && latestVideo.id !== channel.lastVideoId) {
            let telegramGroupId: string | undefined;
            const user = channel.user;

            if (user && 'telegramGroupId' in user) {
              telegramGroupId = user.telegramGroupId;
            }

            // Sử dụng findOneAndUpdate để tránh race condition
            const updatedChannel = await this.channelModel.findOneAndUpdate(
              {
                _id: channel._id,
                $or: [
                  { lastVideoId: { $exists: false } },
                  { lastVideoId: null },
                  { lastVideoId: { $ne: latestVideo.id } },
                ],
              },
              {
                $set: {
                  lastVideoId: latestVideo.id,
                  lastVideoAt: new Date(),
                },
              },
              { new: true },
            );

            this.logger.debug(
              `Kênh ${channel.channelId} đã có video mới: ${latestVideo.id}. lastVideoId trước đó: ${channel.lastVideoId}`,
            );

            // Chỉ gửi tin nhắn nếu thực sự update thành công
            if (updatedChannel && telegramGroupId) {
              // Push job vào queue ngay lập tức khi phát hiện video mới
              await this.telegramQueueService.addTelegramMessageJob({
                groupId: telegramGroupId,
                video: {
                  title: latestVideo.title || '',
                  url: `https://www.youtube.com/watch?v=${latestVideo.id}`,
                  thumbnail: latestVideo.thumbnail,
                  channelId: channel.channelId,
                  jobId: `${channel.channelId}/${latestVideo.id}/${userIdKey}`,
                },
              });
            }
          }
          // else if (!latestVideo) {
          //   // Nếu không lấy được video, thêm lỗi LINK_ERROR
          //   await this.addChannelError(
          //     channel,
          //     ChannelErrorType.SHORT_NOT_FOUND,
          //   );
          // }
        } catch (error) {
          console.log('error :', error);
          // Thêm lỗi NETWORK_ERROR nếu có exception
          await this.addChannelError(channel, ChannelErrorType.NETWORK_ERROR);
        }
      }),
    );

    await Promise.all(tasks);
  }
}
