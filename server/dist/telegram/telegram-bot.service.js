"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramBotService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const telegraf_1 = require("telegraf");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timezone);
let TelegramBotService = class TelegramBotService {
    bot;
    constructor(bot) {
        this.bot = bot;
    }
    async sendNewVideoToGroup(groupId, video) {
        console.log('video :', video);
        console.log('groupId :', groupId);
        const decodeHtmlEntities = (s) => s
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');
        const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const decodedTitle = decodeHtmlEntities(video.title);
        const cleanedTitle = decodedTitle
            .replace(/#[^\s#]+/g, ' ')
            .replace(/\s{2,}/g, ' ')
            .trim();
        const tiktokSearchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(cleanedTitle)}`;
        const publishedText = dayjs(video.publishedAt).format('HH:mm:ss DD/MM/YYYY');
        const caption = [
            `🎬 ${escapeHtml(cleanedTitle)}`,
            `🕒 ${escapeHtml(publishedText)}`,
            `🔎 <a href="${tiktokSearchUrl}">Tìm trên TikTok</a>`,
            `🔗 Youtube: ${escapeHtml(video.url)}`,
        ].join('\n');
        try {
            await this.bot.telegram.sendMessage(groupId, caption, {
                parse_mode: 'HTML',
            });
        }
        catch (error) {
            console.log('error :', error);
        }
    }
};
exports.TelegramBotService = TelegramBotService;
exports.TelegramBotService = TelegramBotService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_telegraf_1.InjectBot)()),
    __metadata("design:paramtypes", [telegraf_1.Telegraf])
], TelegramBotService);
//# sourceMappingURL=telegram-bot.service.js.map