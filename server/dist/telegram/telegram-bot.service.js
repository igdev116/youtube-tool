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
        console.log('video :', video);
        console.log('groupId :', groupId);
        console.log(process.env.CHECK_LONG_VIDEO);
        if (process.env.CHECK_LONG_VIDEO === 'true') {
            try {
                const response = await axios_1.default.get(video.url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
                    },
                });
                const html = response.data;
                const lengthMatch = html.match(/"lengthSeconds"\s*:\s*"(\d+)"/);
                const durationMatch = html.match(/"approxDurationMs"\s*:\s*"(\d+)"/);
                console.log({ lengthMatch, durationMatch });
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
                console.log(err);
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