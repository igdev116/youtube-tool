import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';

// Enable timezone handling
dayjs.extend(utc);
dayjs.extend(timezone);

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
      publishedAt: string; // ISO string (đã luôn có)
    },
  ) {
    // Decode HTML entities để hiển thị đúng ký tự đặc biệt (", ', &, <, >)
    const decodeHtmlEntities = (s: string) =>
      s
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');

    // Escape cho HTML caption an toàn
    const escapeHtml = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Loại bỏ hashtag (ở đầu, ở giữa dính liền cuối từ, hay có khoảng trắng)
    const decodedTitle = decodeHtmlEntities(video.title);
    const cleanedTitle = decodedTitle
      .replace(/#[^\s#]+/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();

    const tiktokSearchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(
      cleanedTitle,
    )}`;

    // Chỉ format trực tiếp, không convert UTC/tz nữa
    const publishedText = dayjs(video.publishedAt).format(
      'HH:mm:ss DD/MM/YYYY',
    );

    const caption = [
      `🎬 ${escapeHtml(cleanedTitle)}`,
      `🕒 ${escapeHtml(publishedText)}`,
      `🔎 <a href="${tiktokSearchUrl}">Tìm trên TikTok</a>`,
      `🔗 Youtube: ${escapeHtml(video.url)}`,
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
