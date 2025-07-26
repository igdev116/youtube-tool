import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  YoutubeChannel,
  YoutubeChannelDocument,
} from './youtube-channel.schema';
import { extractChannelIdFromUrl } from './youtube-channel.utils';
import { BulkChannelDto } from './dto/bulk-channel.dto';
import { paginateWithCursor } from '../../utils/pagination.util';
import { extractFirstVideoIdFromYt } from './youtube-channel.utils';
import { UserService } from '../../user/user.service';
import { TelegramBotService } from '../../telegram/telegram-bot.service';
import pLimit from 'p-limit';
import { sleep } from '../../utils/sleep.util';

@Injectable()
export class YoutubeChannelService {
  constructor(
    @InjectModel(YoutubeChannel.name)
    private readonly channelModel: Model<YoutubeChannelDocument>,
    private readonly userService: UserService,
    private readonly telegramBotService: TelegramBotService,
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
    limit: number,
    cursor?: string,
  ) {
    return paginateWithCursor<YoutubeChannelDocument>(
      this.channelModel,
      { user: userId },
      limit,
      cursor,
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

  /**
   * Kiểm tra ngay 1 kênh có video mới không, trả về thông tin video mới nếu có
   */
  async testCheckNewVideo() {
    await this.notifyAllChannelsNewVideo();
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
          if (latestVideo) {
            let telegramGroupId: string | undefined;
            const user = channel.user;
            if (user && typeof user === 'object' && 'telegramGroupId' in user) {
              telegramGroupId = user.telegramGroupId;
            }
            channel.lastVideoId = latestVideo.id;
            await channel.save();
            if (telegramGroupId) {
              console.log('telegramGroupId :', telegramGroupId);
              await this.telegramBotService.sendNewVideoToGroup(
                telegramGroupId,
                {
                  title: latestVideo.title || '',
                  url: `https://www.youtube.com/watch?v=${latestVideo.id}`,
                  thumbnail: latestVideo.thumbnail,
                  channelId: channel.channelId,
                },
              );
              await sleep(1100);
            }
          }
        } catch {
          // Có thể log lỗi hoặc xử lý retry nếu cần
        }
      }),
    );
    await Promise.all(tasks);
  }
}
