import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { TELEGRAM_SEND_MESSAGE_URL, YT_AVATAR_URL } from '../constants';
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
      channelName?: string;
      channelUrl?: string;
      thumbnail: string;
      publishedAt: string; // ISO string (đã luôn có)
      avatarId?: string; // Avatar ID của channel
    },
    botToken: string,
  ) {
    console.log('video :', video);
    console.log('groupId :', groupId);

    console.log(process.env.CHECK_LONG_VIDEO);

    // Kích hoạt tính năng check video dài theo biến môi trường CHECK_LONG_VIDEO
    if (process.env.CHECK_LONG_VIDEO === 'true') {
      try {
        const response = await axios.get(video.url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
          },
        });
        const html = response.data;

        // Ưu tiên tìm "lengthSeconds" hoặc "approxDurationMs"
        const lengthMatch = html.match(/"lengthSeconds"\s*:\s*"(\d+)"/);
        const durationMatch = html.match(/"approxDurationMs"\s*:\s*"(\d+)"/);

        let videoSeconds = 0;

        if (lengthMatch) {
          videoSeconds = parseInt(lengthMatch[1], 10);
        } else if (durationMatch) {
          videoSeconds = Math.floor(parseInt(durationMatch[1], 10) / 1000);
        }

        if (videoSeconds > 0 && videoSeconds <= 180) {
          console.log(
            `Video duration is ${videoSeconds}s (<= 180s). Treat as Short video -> Skipping.`,
          );
          return;
        }
      } catch (err) {
        console.log(err);

        console.error(
          'Error fetching video HTML for duration check:',
          err.message,
        );
      }
    }

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

    // Bảo đảm hiển thị đúng giờ Việt Nam ngay cả khi input là ISO dạng Z (UTC)
    const publishedText = dayjs
      .utc(video.publishedAt)
      .tz('Asia/Ho_Chi_Minh')
      .format('HH:mm:ss DD/MM/YYYY');

    // Trở lại format cũ: kênh (không link) → tiêu đề → thời gian → tìm TikTok → link YouTube ở cuối
    const captionParts: string[] = [];
    if (video.channelId) {
      captionParts.push(`ID: ${escapeHtml(video.channelId)}`);
    }
    if (video.channelName || video.channelId) {
      const channelLabel = video.channelName || video.channelId || '';
      const bold = `<b>${escapeHtml(channelLabel)}</b>`;
      captionParts.push(`📺 ${bold}`);
    }
    captionParts.push(`🎬 ${escapeHtml(displayTitle)}`);
    captionParts.push(`🕒 ${escapeHtml(publishedText)}`);

    if (hasTitle) {
      const tiktokSearchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(
        cleaned,
      )}`;
      captionParts.push(`🔎 <a href="${tiktokSearchUrl}">Tìm trên TikTok</a>`);
    }
    captionParts.push(`🔗 Youtube: ${escapeHtml(video.url)}`);

    const caption = captionParts.join('\n');

    try {
      // Nếu có avatarId, gửi ảnh với caption
      if (video.avatarId) {
        const photoApiUrl = `https://api.telegram.org/bot${botToken}/sendPhoto`;
        const avatarUrl = YT_AVATAR_URL(video.avatarId, 'MEDIUM'); // Sử dụng độ phân giải 800
        await axios.post(photoApiUrl, {
          chat_id: groupId,
          photo: avatarUrl,
          caption: caption,
          parse_mode: 'HTML',
        });
      } else {
        // Fallback về gửi text nếu không có avatar
        const apiUrl = TELEGRAM_SEND_MESSAGE_URL(botToken);
        await axios.post(apiUrl, {
          chat_id: groupId,
          text: caption,
          parse_mode: 'HTML',
        });
      }
    } catch (error) {
      console.log('error :', error);
    }
  }
}
