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
    console.log('video ->', video);

    const isNewServerVal = String(process.env.IS_NEW_SERVER || '')
      .trim()
      .toLowerCase();
    const isCheckEnabled = isNewServerVal === 'true';
    if (isCheckEnabled) {
      try {
        // Trích xuất video ID từ URL (hỗ trợ cả /watch?v=ID và /shorts/ID)
        const videoIdMatch = video.url.match(
          /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        );
        const videoId = videoIdMatch?.[1];

        if (!videoId) {
          console.warn('Không thể trích xuất ID từ URL:', video.url);
        } else {
          const apiKey = process.env.YOUTUBE_API_KEY;
          if (!apiKey) {
            console.warn(
              '⚠️ CHƯA CÀI YOUTUBE_API_KEY TRONG .ENV, bỏ qua kiểm tra thời lượng.',
            );
          } else {
            console.log(`Đang check duration qua API cho video: ${videoId}`);
            const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${apiKey}`;
            const apiRes = await fetch(apiUrl, {
              signal: AbortSignal.timeout(10000),
            });
            const apiData = (await apiRes.json()) as {
              items?: { contentDetails?: { duration?: string } }[];
            };

            console.log({ apiData });

            const isoDuration = apiData.items?.[0]?.contentDetails?.duration; // Format: PT1M30S

            if (isoDuration) {
              // Parse ISO 8601 duration thành tổng số giây
              const match = isoDuration.match(
                /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/,
              );
              const hours = parseInt(match?.[1] ?? '0', 10);
              const minutes = parseInt(match?.[2] ?? '0', 10);
              const seconds = parseInt(match?.[3] ?? '0', 10);
              const totalSeconds = hours * 3600 + minutes * 60 + seconds;

              console.log(`Video duration: ${totalSeconds}s (${isoDuration})`);

              // Nếu là Shorts (<= 180s) thì skip
              if (totalSeconds > 0 && totalSeconds <= 180) {
                console.log(
                  `Video quá ngắn (${totalSeconds}s <= 180s). Bỏ qua không gửi Telegram.`,
                );
                return;
              }
              console.log(`Video hợp lệ (> 180s). Đang chuẩn bị gửi...`);
            } else {
              console.warn('API không trả về thông tin thời lượng video.');
            }
          }
        }
      } catch (err) {
        console.error('Lỗi khi gọi YouTube API check duration:', err.message);
        // Fail-safe: Nếu API lỗi, mặc định vẫn gửi để tránh miss video quan trọng
        console.log('Mặc định gửi video do API lỗi.');
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
    if (isCheckEnabled && video.channelId) {
      captionParts.push(`ID: ${escapeHtml(video.channelId)}`);
    }
    if (video.channelName || video.channelId) {
      const channelLabel = video.channelName || video.channelId || '';
      const bold = `<b>${escapeHtml(channelLabel)}</b>`;
      captionParts.push(`📺 ${bold}`);
    }
    captionParts.push(`${escapeHtml(displayTitle)}`);
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
