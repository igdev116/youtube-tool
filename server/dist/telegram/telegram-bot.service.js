"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramBotService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const constants_1 = require("../constants");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timezone);
let TelegramBotService = class TelegramBotService {
    async sendNewVideoToGroup(groupId, video, botToken) {
        console.log('video ->', video);
        console.log('CHECK_LONG_VIDEO', process.env.CHECK_LONG_VIDEO, process.env.CHECK_LONG_VIDEO === 'true');
        if (process.env.CHECK_LONG_VIDEO === 'true') {
            try {
                const response = await axios_1.default.get(video.url, {
                    headers: {
                        accept: '*/*',
                        'accept-language': 'en,vi;q=0.9,es;q=0.8,en-US;q=0.7',
                        cookie: 'VISITOR_INFO1_LIVE=WtdPG-ktm5Q; VISITOR_PRIVACY_METADATA=CgJWThIEGgAgVw%3D%3D; YSC=6bvgKc7BhTY; PREF=f4=4000000&tz=Asia.Saigon&f7=100&f6=40000000; HSID=A1vpBhdZKjxm5xP65; SSID=A8K0YRzrpC6OLchRu; APISID=UcCG-01ZZzf-Fi0P/A-sS4rq-a_CQJoGom; SAPISID=J6Ai2j-_8Go_2A5r/ASGwjIxj5Xjtnp5qZ; __Secure-1PAPISID=J6Ai2j-_8Go_2A5r/ASGwjIxj5Xjtnp5qZ; __Secure-3PAPISID=J6Ai2j-_8Go_2A5r/ASGwjIxj5Xjtnp5qZ; SID=g.a0008QhzjXgoJEReJn5hSKLomLSsijHg02PXcCjrf0XTH7tThqaAXCDAg6SYbDVvoU_nWI1NkAACgYKARUSARYSFQHGX2MiTrrwcwbypAhlBl6ilduEjhoVAUF8yKoSsREPJaPMDdLi2gEGZ18Q0076; __Secure-1PSID=g.a0008QhzjXgoJEReJn5hSKLomLSsijHg02PXcCjrf0XTH7tThqaAiuDSxBSMqP_CAw_dcWd6bwACgYKAcESARYSFQHGX2MiT1d77q8UsMNzkN4tZR06XhoVAUF8yKqKOOt1INny3bmW_fV4m1vs0076; __Secure-3PSID=g.a0008QhzjXgoJEReJn5hSKLomLSsijHg02PXcCjrf0XTH7tThqaARmHzDlyLtmCASMoE9OV-CgACgYKARASARYSFQHGX2MiXL1zX6pchMlQT5eyf1xauxoVAUF8yKqwQhBiBJtbeve-Ue2gG8i40076; __Secure-ROLLOUT_TOKEN=CLPQ0-2e7pHfhAEQp7r9zue0kgMYycqbn7XKkwM%3D; LOGIN_INFO=AFmmF2swRQIhANwy064o7OcdNdMtPeG1kt1ecmvbRAAQvL8s_StAgFl2AiBzcd3RI13kihygp1LyNXq_YIhsP4SKq5wWbqkOtIA5Jw:QUQ3MjNmeWMxOUJpbEZVa2o0QUFtYVRtakZVVjdPZFVJbjFXZVdndTlBMWhKcmQxNnpqTE93SnFrMTEtemxMZS1acEd2N1hZdnhVTG10SFVsTE5LaVR2UU1PbUlKSTBVY0VtbjIzVDcyT3RZLVoxRFdVYXVkZHEwZUYxUTJQX3h0UjRXdnhlSFpYaWlOQlJud3Etd1VZYnpwMEVWSzZSeWVB; __Secure-1PSIDTS=sidts-CjUBWhotCeUR7sjvI6YmIWr_kJZ-QK0FtDfNyeeCJ_kN315fYL2_vIBH34YwKC03IAinZ4zvbBAA; __Secure-3PSIDTS=sidts-CjUBWhotCeUR7sjvI6YmIWr_kJZ-QK0FtDfNyeeCJ_kN315fYL2_vIBH34YwKC03IAinZ4zvbBAA; SIDCC=AKEyXzUgLL2kxfW16hsxLFP-9GbHFs3wBt9i4Vh7eGcr-w7Dgu_LlIAuZj_x8PMR9YXQr7JbEg; __Secure-1PSIDCC=AKEyXzXjbNFcKjZVarPwKasU9-uiqGVwoPf0wHUk_kO0fbYoaTbQ2RLy4m7-d-y0l2Gsz_K92Q; __Secure-3PSIDCC=AKEyXzWcdqdYGuFfMJ-HPINcEK10YLlAvR-qriefgJUzJxnAGbv_j3EY-8D2ckCu3y5EP_Xv2g0',
                        'device-memory': '8',
                        priority: 'u=1, i',
                        referer: video.url,
                        'sec-ch-dpr': '2',
                        'sec-ch-ua': '"Chromium";v="146", "Not-A.Brand";v="24", "Google Chrome";v="146"',
                        'sec-ch-ua-arch': '"arm"',
                        'sec-ch-ua-bitness': '"64"',
                        'sec-ch-ua-form-factors': '"Desktop"',
                        'sec-ch-ua-full-version': '"146.0.7680.165"',
                        'sec-ch-ua-full-version-list': '"Chromium";v="146.0.7680.165", "Not-A.Brand";v="24.0.0.0", "Google Chrome";v="146.0.7680.165"',
                        'sec-ch-ua-mobile': '?0',
                        'sec-ch-ua-model': '""',
                        'sec-ch-ua-platform': '"macOS"',
                        'sec-ch-ua-platform-version': '"26.1.0"',
                        'sec-ch-ua-wow64': '?0',
                        'sec-ch-viewport-width': '1440',
                        'sec-fetch-dest': 'empty',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-site': 'same-origin',
                        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
                        'x-browser-channel': 'stable',
                        'x-browser-copyright': 'Copyright 2026 Google LLC. All Rights reserved.',
                        'x-browser-validation': 'SgDQo8mvrGRdD61Pwo8wyWVgYgs=',
                        'x-browser-year': '2026',
                        'x-client-data': 'CKK1yQEIkbbJAQiitskBCKmdygEI3O7KAQiUocsBCIagzQEIu67PAQjYu88BCJS8zwEYzK3PAQ==',
                    },
                    timeout: 15000,
                });
                const html = response.data;
                const lengthMatch = html.match(/"lengthSeconds"\s*:\s*"(\d+)"/);
                const durationMatch = html.match(/"approxDurationMs"\s*:\s*"(\d+)"/);
                let videoSeconds = 0;
                if (lengthMatch) {
                    videoSeconds = parseInt(lengthMatch[1], 10);
                }
                else if (durationMatch) {
                    videoSeconds = Math.floor(parseInt(durationMatch[1], 10) / 1000);
                }
                if (videoSeconds > 0 && videoSeconds <= 180) {
                    console.log(`Video duration is ${videoSeconds}s (<= 180s). Treat as Short video -> Skipping.`);
                    return;
                }
            }
            catch (err) {
                console.error('Error fetching video HTML for duration check:', err.message);
            }
        }
        const decodeHtmlEntities = (s) => s
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');
        const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const rawTitle = (video.title || '').trim();
        const decodedTitle = decodeHtmlEntities(rawTitle);
        const cleaned = decodedTitle
            .replace(/#[^\s#]+/g, ' ')
            .replace(/\s{2,}/g, ' ')
            .trim();
        const hasTitle = cleaned.length > 0;
        const displayTitle = hasTitle ? cleaned : 'Không có tiêu đề';
        const publishedText = dayjs
            .utc(video.publishedAt)
            .tz('Asia/Ho_Chi_Minh')
            .format('HH:mm:ss DD/MM/YYYY');
        const captionParts = [];
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
            const tiktokSearchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(cleaned)}`;
            captionParts.push(`🔎 <a href="${tiktokSearchUrl}">Tìm trên TikTok</a>`);
        }
        captionParts.push(`🔗 Youtube: ${escapeHtml(video.url)}`);
        const caption = captionParts.join('\n');
        try {
            if (video.avatarId) {
                const photoApiUrl = `https://api.telegram.org/bot${botToken}/sendPhoto`;
                const avatarUrl = (0, constants_1.YT_AVATAR_URL)(video.avatarId, 'MEDIUM');
                await axios_1.default.post(photoApiUrl, {
                    chat_id: groupId,
                    photo: avatarUrl,
                    caption: caption,
                    parse_mode: 'HTML',
                });
            }
            else {
                const apiUrl = (0, constants_1.TELEGRAM_SEND_MESSAGE_URL)(botToken);
                await axios_1.default.post(apiUrl, {
                    chat_id: groupId,
                    text: caption,
                    parse_mode: 'HTML',
                });
            }
        }
        catch (error) {
            console.log('error :', error);
        }
    }
};
exports.TelegramBotService = TelegramBotService;
exports.TelegramBotService = TelegramBotService = __decorate([
    (0, common_1.Injectable)()
], TelegramBotService);
//# sourceMappingURL=telegram-bot.service.js.map