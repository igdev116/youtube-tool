import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import {
  YoutubeChannel,
  YoutubeChannelDocument,
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
   * Nhận mảng object { link, isActive, userId }, extract channelId, kiểm tra hợp lệ, nếu có lỗi trả về message, nếu hợp lệ mới lưu vào DB
   */
  async addChannelsBulk(channels: BulkChannelDto[], userId: string) {
    const errorLinks: { link: string; reason: string }[] = [];
    const docs: YoutubeChannelDocument[] = [];
    const limit = pLimit(5); // Giới hạn 5 promise song song
    const tasks = channels.map((item) =>
      limit(async () => {
        const channelId = await extractChannelIdFromUrl(item.link);
        if (!channelId) {
          errorLinks.push({ link: item.link, reason: 'không hợp lệ' });
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

    const limit = pLimit(5);
    const tasks = activeChannels.map((channel) =>
      limit(async () => {
        try {
          const url = `https://www.youtube.com/${channel.channelId}`;
          const latestVideo = await extractFirstVideoIdFromYt(url);

          if (latestVideo && latestVideo.id !== channel.lastVideoId) {
            let telegramGroupId: string | undefined;
            const user = channel.user;

            if (user && 'telegramGroupId' in user) {
              telegramGroupId = user.telegramGroupId;
            }

            channel.lastVideoId = latestVideo.id;
            await channel.save();

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
        } catch (error) {
          console.log('error :', error);
          // Có thể log lỗi hoặc xử lý retry nếu cần
        }
      }),
    );
    console.log('tasks :', tasks.length);
    await Promise.all(tasks);
  }
}
