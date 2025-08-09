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
    // Loại bỏ hashtag (#tag) và chuẩn hóa khoảng trắng
    const cleanedTitle = video.title
      .replace(/(^|\s)#[^\s#]+/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();

    const tiktokSearchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(
      cleanedTitle,
    )}`;

    // Escape cho HTML caption an toàn
    const escapeHtml = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const caption = [
      `🎬 ${escapeHtml(cleanedTitle)}`,
      `🔎 <a href="${tiktokSearchUrl}">Tìm trên TikTok</a>`,
      `🔗 Youtube: ${video.url}`,
    ].join('\n');

    try {
      await this.bot.telegram.sendPhoto(groupId, video.thumbnail, {
        caption,
        parse_mode: 'HTML',
      });
    } catch (err: any) {
      // Có thể log lỗi hoặc xử lý retry nếu cần
      console.error('Gửi Telegram thất bại', err?.message);
    }
  }
}
