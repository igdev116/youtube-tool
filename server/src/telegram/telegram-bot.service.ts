import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import * as dayjs from 'dayjs';

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
      publishedAt?: string; // ISO string
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

    // Loại bỏ hashtag (#tag) và chuẩn hóa khoảng trắng trên tiêu đề đã decode
    const decodedTitle = decodeHtmlEntities(video.title);
    const cleanedTitle = decodedTitle
      .replace(/(^|\s)#[^\s#]+/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();

    const tiktokSearchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(
      cleanedTitle,
    )}`;

    const publishedText = video.publishedAt
      ? dayjs(video.publishedAt).format('HH:mm:ss DD/MM/YYYY')
      : undefined;

    const caption = [
      `🎬 ${escapeHtml(cleanedTitle)}`,
      publishedText ? `🕒 ${escapeHtml(publishedText)}` : undefined,
      `🔎 <a href="${tiktokSearchUrl}">Tìm trên TikTok</a>`,
      `🔗 Youtube: ${escapeHtml(video.url)}`,
    ]
      .filter(Boolean)
      .join('\n');

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
