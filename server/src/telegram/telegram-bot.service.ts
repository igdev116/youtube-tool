import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { TELEGRAM_SEND_MESSAGE_URL } from '../constants';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';

// Enable timezone handling
dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class TelegramBotService {
  async sendNewVideoToGroup(
    groupId: string,
    video: {
      title: string;
      url: string;
      channelId?: string;
      thumbnail: string;
      publishedAt: string; // ISO string (đã luôn có)
    },
    botToken: string,
  ) {
    console.log('video :', video);
    console.log('groupId :', groupId);
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

    // Xử lý tiêu đề (fallback nếu không có)
    const rawTitle = (video.title || '').trim();
    const decodedTitle = decodeHtmlEntities(rawTitle);
    const cleaned = decodedTitle
      .replace(/#[^\s#]+/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
    const hasTitle = cleaned.length > 0;
    const displayTitle = hasTitle ? cleaned : 'Không có tiêu đề';

    // Chỉ format trực tiếp, không convert UTC/tz nữa
    const publishedText = dayjs(video.publishedAt).format(
      'HH:mm:ss DD/MM/YYYY',
    );

    const captionParts: string[] = [];
    captionParts.push(`🎬 ${escapeHtml(displayTitle)}`);
    captionParts.push(`🕒 ${escapeHtml(publishedText)}`);

    // Chỉ hiển thị tìm TikTok khi có tiêu đề
    if (hasTitle) {
      const tiktokSearchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(
        cleaned,
      )}`;
      captionParts.push(`🔎 <a href="${tiktokSearchUrl}">Tìm trên TikTok</a>`);
    }

    captionParts.push(`🔗 Youtube: ${escapeHtml(video.url)}`);

    const caption = captionParts.join('\n');

    try {
      const apiUrl = TELEGRAM_SEND_MESSAGE_URL(botToken);
      await axios.post(apiUrl, {
        chat_id: groupId,
        text: caption,
        parse_mode: 'HTML',
      });
    } catch (error) {
      console.log('error :', error);
    }
  }
}
