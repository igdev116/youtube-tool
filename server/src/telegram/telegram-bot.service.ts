import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';

@Injectable()
export class TelegramBotService {
  constructor(@InjectBot() private readonly bot: Telegraf) {}

  async sendNewVideoToGroup(
    groupId: string,
    video: {
      title: string;
      url: string;
      channelId?: string;
      thumbnail: string;
    },
  ) {
    try {
      await this.bot.telegram.sendMessage(groupId, video.url);
    } catch (err: any) {
      // Có thể log lỗi hoặc xử lý retry nếu cần
      console.error('Gửi Telegram thất bại', err?.message);
    }
  }
}
