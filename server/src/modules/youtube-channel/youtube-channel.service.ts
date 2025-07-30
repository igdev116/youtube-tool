import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
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
  constructor(
    @InjectModel(YoutubeChannel.name)
    private readonly channelModel: Model<YoutubeChannelDocument>,
    private readonly userService: UserService,
    private readonly telegramBotService: TelegramBotService,
    private readonly telegramQueueService: TelegramQueueService,
  ) {}

  /**
   * Thêm lỗi vào channel và toggle isActive thành false nếu cần
   */
  private async addChannelError(
    channel: YoutubeChannelDocument,
    errorType: ChannelErrorType,
  ) {
    const updateData: any = {};

    // Chỉ thêm lỗi nếu chưa có
    const currentErrors = channel.errors || [];
    if (!currentErrors.includes(errorType)) {
      updateData.$addToSet = { errors: errorType };
    }

    // Nếu là LINK_ERROR, toggle isActive thành false
    if (errorType === ChannelErrorType.LINK_ERROR) {
      updateData.isActive = false;
      // console.log(`❌ Channel ${channel.channelId} bị tắt do lỗi link`);
    }

    if (Object.keys(updateData).length > 0) {
      await this.channelModel.updateOne({ _id: channel._id }, updateData);
      // console.log(
      //   `⚠️ Đã thêm lỗi ${errorType} cho channel ${channel.channelId}`,
      // );
    }
  }

  /**
   * Nhận mảng object { link, isActive, userId }, extract channelId, kiểm tra hợp lệ, nếu có lỗi trả về message, nếu hợp lệ mới lưu vào DB
   */
  async addChannelsBulk(channels: BulkChannelDto[], userId: string) {
    const errorLinks: { link: string; reason: string }[] = [];
    const docs: YoutubeChannelDocument[] = [];
    const limit = pLimit(100); // Giới hạn 5 promise song song
    const tasks = channels.map((item) =>
      limit(async () => {
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
      filter.channelId = { $regex: keyword, $options: 'i' };
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
    const activeChannels = await this.channelModel
      .find({ isActive: true })
      .populate('user')
      .exec();

    const limit = pLimit(3); // Giảm từ 5 xuống 3 để tránh quá tải
    const processingChannels = new Set<string>(); // Track channels đang xử lý

    const tasks = activeChannels.map((channel) =>
      limit(async () => {
        // Kiểm tra channel đã được xử lý chưa
        if (processingChannels.has(channel.channelId)) {
          return;
        }

        processingChannels.add(channel.channelId);

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

            // Chỉ gửi tin nhắn nếu thực sự update thành công
            if (updatedChannel) {
              if (telegramGroupId) {
                // Push job vào queue ngay lập tức khi phát hiện video mới
                await this.telegramQueueService.addTelegramMessageJob({
                  groupId: telegramGroupId,
                  video: {
                    title: latestVideo.title || '',
                    url: `https://www.youtube.com/watch?v=${latestVideo.id}`,
                    thumbnail: latestVideo.thumbnail,
                    channelId: channel.channelId,
                  },
                });
              }
            }
          } else if (!latestVideo) {
            // Nếu không lấy được video, thêm lỗi LINK_ERROR
            await this.addChannelError(
              channel,
              ChannelErrorType.SHORT_NOT_FOUND,
            );
          }
        } catch (error) {
          console.log('error :', error);
          // Thêm lỗi NETWORK_ERROR nếu có exception
          await this.addChannelError(channel, ChannelErrorType.NETWORK_ERROR);
        } finally {
          // Luôn remove khỏi processing set
          processingChannels.delete(channel.channelId);
        }
      }),
    );

    await Promise.all(tasks);
  }
}
