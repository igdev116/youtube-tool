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

    const checkLongVideoVal = String(process.env.CHECK_LONG_VIDEO || '')
      .trim()
      .toLowerCase();
    const isCheckEnabled = checkLongVideoVal === 'true';

    // Kích hoạt tính năng check video dài theo biến môi trường CHECK_LONG_VIDEO
    if (isCheckEnabled) {
      try {
        const response = await axios.get(video.url, {
          headers: {
            accept: '*/*',
            'accept-language': 'en,vi;q=0.9,es;q=0.8,en-US;q=0.7',
            cookie:
              'VISITOR_INFO1_LIVE=WtdPG-ktm5Q; VISITOR_PRIVACY_METADATA=CgJWThIEGgAgVw%3D%3D; YSC=6bvgKc7BhTY; PREF=f4=4000000&tz=Asia.Saigon&f7=100&f6=40000000; HSID=A1vpBhdZKjxm5xP65; SSID=A8K0YRzrpC6OLchRu; APISID=UcCG-01ZZzf-Fi0P/A-sS4rq-a_CQJoGom; SAPISID=J6Ai2j-_8Go_2A5r/ASGwjIxj5Xjtnp5qZ; __Secure-1PAPISID=J6Ai2j-_8Go_2A5r/ASGwjIxj5Xjtnp5qZ; __Secure-3PAPISID=J6Ai2j-_8Go_2A5r/ASGwjIxj5Xjtnp5qZ; SID=g.a0008QhzjXgoJEReJn5hSKLomLSsijHg02PXcCjrf0XTH7tThqaAXCDAg6SYbDVvoU_nWI1NkAACgYKARUSARYSFQHGX2MiTrrwcwbypAhlBl6ilduEjhoVAUF8yKoSsREPJaPMDdLi2gEGZ18Q0076; __Secure-1PSID=g.a0008QhzjXgoJEReJn5hSKLomLSsijHg02PXcCjrf0XTH7tThqaAiuDSxBSMqP_CAw_dcWd6bwACgYKAcESARYSFQHGX2MiT1d77q8UsMNzkN4tZR06XhoVAUF8yKqKOOt1INny3bmW_fV4m1vs0076; __Secure-3PSID=g.a0008QhzjXgoJEReJn5hSKLomLSsijHg02PXcCjrf0XTH7tThqaARmHzDlyLtmCASMoE9OV-CgACgYKARASARYSFQHGX2MiXL1zX6pchMlQT5eyf1xauxoVAUF8yKqwQhBiBJtbeve-Ue2gG8i40076; __Secure-ROLLOUT_TOKEN=CLPQ0-2e7pHfhAEQp7r9zue0kgMYycqbn7XKkwM%3D; LOGIN_INFO=AFmmF2swRQIhANwy064o7OcdNdMtPeG1kt1ecmvbRAAQvL8s_StAgFl2AiBzcd3RI13kihygp1LyNXq_YIhsP4SKq5wWbqkOtIA5Jw:QUQ3MjNmeWMxOUJpbEZVa2o0QUFtYVRtakZVVjdPZFVJbjFXZVdndTlBMWhKcmQxNnpqTE93SnFrMTEtemxMZS1acEd2N1hZdnhVTG10SFVsTE5LaVR2UU1PbUlKSTBVY0VtbjIzVDcyT3RZLVoxRFdVYXVkZHEwZUYxUTJQX3h0UjRXdnhlSFpYaWlOQlJud3Etd1VZYnpwMEVWSzZSeWVB; __Secure-1PSIDTS=sidts-CjUBWhotCeUR7sjvI6YmIWr_kJZ-QK0FtDfNyeeCJ_kN315fYL2_vIBH34YwKC03IAinZ4zvbBAA; __Secure-3PSIDTS=sidts-CjUBWhotCeUR7sjvI6YmIWr_kJZ-QK0FtDfNyeeCJ_kN315fYL2_vIBH34YwKC03IAinZ4zvbBAA; SIDCC=AKEyXzUgLL2kxfW16hsxLFP-9GbHFs3wBt9i4Vh7eGcr-w7Dgu_LlIAuZj_x8PMR9YXQr7JbEg; __Secure-1PSIDCC=AKEyXzXjbNFcKjZVarPwKasU9-uiqGVwoPf0wHUk_kO0fbYoaTbQ2RLy4m7-d-y0l2Gsz_K92Q; __Secure-3PSIDCC=AKEyXzWcdqdYGuFfMJ-HPINcEK10YLlAvR-qriefgJUzJxnAGbv_j3EY-8D2ckCu3y5EP_Xv2g0',
            'device-memory': '8',
            priority: 'u=1, i',
            referer: video.url,
            'sec-ch-dpr': '2',
            'sec-ch-ua':
              '"Chromium";v="146", "Not-A.Brand";v="24", "Google Chrome";v="146"',
            'sec-ch-ua-arch': '"arm"',
            'sec-ch-ua-bitness': '"64"',
            'sec-ch-ua-form-factors': '"Desktop"',
            'sec-ch-ua-full-version': '"146.0.7680.165"',
            'sec-ch-ua-full-version-list':
              '"Chromium";v="146.0.7680.165", "Not-A.Brand";v="24.0.0.0", "Google Chrome";v="146.0.7680.165"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-model': '""',
            'sec-ch-ua-platform': '"macOS"',
            'sec-ch-ua-platform-version': '"26.1.0"',
            'sec-ch-ua-wow64': '?0',
            'sec-ch-viewport-width': '1440',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
            'x-browser-channel': 'stable',
            'x-browser-copyright':
              'Copyright 2026 Google LLC. All Rights reserved.',
            'x-browser-validation': 'SgDQo8mvrGRdD61Pwo8wyWVgYgs=',
            'x-browser-year': '2026',
            'x-client-data':
              'CKK1yQEIkbbJAQiitskBCKmdygEI3O7KAQiUocsBCIagzQEIu67PAQjYu88BCJS8zwEYzK3PAQ==',
          },
          timeout: 15000,
        });
        const html = response.data;

        // Gửi HTML về Telegram để debug (dưới dạng file vì quá dài cho tin nhắn)
        try {
          const formData = new FormData();
          formData.append('chat_id', groupId);
          const blob = new Blob([html], { type: 'text/html' });
          formData.append('document', blob, 'debug_youtube_page.html');
          await axios.post(
            `https://api.telegram.org/bot${botToken}/sendDocument`,
            formData,
          );
        } catch (debugErr) {
          console.error('Debug: Failed to send HTML document:', debugErr.message);
        }

        // Ưu tiên tìm "lengthSeconds" hoặc "approxDurationMs"
        const lengthMatch = html.match(/"lengthSeconds"\s*:\s*"(\d+)"/);

        const durationMatch = html.match(/"approxDurationMs"\s*:\s*"(\d+)"/);
        console.log({ lengthMatch, durationMatch });

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
