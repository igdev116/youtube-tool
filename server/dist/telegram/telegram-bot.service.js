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
        const checkLongVideoVal = String(process.env.CHECK_LONG_VIDEO || '')
            .trim()
            .toLowerCase();
        const isCheckEnabled = checkLongVideoVal === 'true';
        if (isCheckEnabled) {
            try {
                const videoIdMatch = video.url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                const videoId = videoIdMatch?.[1];
                if (!videoId) {
                    console.warn('Không thể trích xuất ID từ URL:', video.url);
                }
                else {
                    const apiKey = process.env.YOUTUBE_API_KEY;
                    if (!apiKey) {
                        console.warn('⚠️ CHƯA CÀI YOUTUBE_API_KEY TRONG .ENV, bỏ qua kiểm tra thời lượng.');
                    }
                    else {
                        console.log(`Đang check duration qua API cho video: ${videoId}`);
                        const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${apiKey}`;
                        const apiRes = await fetch(apiUrl, {
                            signal: AbortSignal.timeout(10000),
                        });
                        const apiData = (await apiRes.json());
                        console.log({ apiData });
                        const isoDuration = apiData.items?.[0]?.contentDetails?.duration;
                        if (isoDuration) {
                            const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
                            const hours = parseInt(match?.[1] ?? '0', 10);
                            const minutes = parseInt(match?.[2] ?? '0', 10);
                            const seconds = parseInt(match?.[3] ?? '0', 10);
                            const totalSeconds = hours * 3600 + minutes * 60 + seconds;
                            console.log(`Video duration: ${totalSeconds}s (${isoDuration})`);
                            if (totalSeconds > 0 && totalSeconds <= 180) {
                                console.log(`Video quá ngắn (${totalSeconds}s <= 180s). Bỏ qua không gửi Telegram.`);
                                return;
                            }
                            console.log(`Video hợp lệ (> 180s). Đang chuẩn bị gửi...`);
                        }
                        else {
                            console.warn('API không trả về thông tin thời lượng video.');
                        }
                    }
                }
            }
            catch (err) {
                console.error('Lỗi khi gọi YouTube API check duration:', err.message);
                console.log('Mặc định gửi video do API lỗi.');
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