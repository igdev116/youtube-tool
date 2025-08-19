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
var YoutubeWebsubService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.YoutubeWebsubService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const youtube_channel_schema_1 = require("../youtube-channel/youtube-channel.schema");
const telegram_bot_service_1 = require("../../telegram/telegram-bot.service");
const constants_1 = require("../../constants");
let YoutubeWebsubService = YoutubeWebsubService_1 = class YoutubeWebsubService {
    channelModel;
    telegramBotService;
    logger = new common_1.Logger(YoutubeWebsubService_1.name);
    constructor(channelModel, telegramBotService) {
        this.channelModel = channelModel;
        this.telegramBotService = telegramBotService;
    }
    extractEntries(xml) {
        const entries = [];
        const re = /<entry[\s\S]*?<\/entry>/g;
        let m;
        while ((m = re.exec(xml)) !== null) {
            entries.push(m[0]);
        }
        return entries;
    }
    extractTag(content, tag) {
        const m = content.match(new RegExp(`<${tag}>([^<]*?)</${tag}>`));
        return m ? m[1] : null;
    }
    extractNsTag(content, nsTag) {
        const m = content.match(new RegExp(`<${nsTag}>([^<]*?)</${nsTag}>`));
        return m ? m[1] : null;
    }
    async handleNotification(xml) {
        try {
            const entries = this.extractEntries(xml);
            if (entries.length === 0) {
                this.logger.debug('WebSub: no entry found');
                return;
            }
            for (const entry of entries) {
                const videoId = this.extractNsTag(entry, 'yt:videoId') ||
                    this.extractTag(entry, 'yt:videoId');
                const xmlChannelId = this.extractNsTag(entry, 'yt:channelId') ||
                    this.extractTag(entry, 'yt:channelId');
                const title = this.extractTag(entry, 'title') || '';
                const publishedAt = this.extractTag(entry, 'published') || '';
                const thumbnail = (0, constants_1.YT_THUMBNAIL_HQ)(videoId || '');
                const authorBlockMatch = entry.match(/<author[\s\S]*?<\/author>/);
                const authorBlock = authorBlockMatch ? authorBlockMatch[0] : '';
                const channelName = authorBlock
                    ? this.extractTag(authorBlock, 'name') || ''
                    : '';
                const channelUrl = authorBlock
                    ? this.extractTag(authorBlock, 'uri') || ''
                    : '';
                if (!videoId || !xmlChannelId)
                    continue;
                const channels = await this.channelModel
                    .find({ xmlChannelId: xmlChannelId, isActive: true })
                    .populate('user')
                    .exec();
                const channelPromises = channels.map(async (ch) => {
                    const user = ch.user;
                    const groupId = user?.telegramGroupId;
                    const botToken = user?.botToken;
                    if (!groupId || !botToken)
                        return null;
                    const videoPublishedAt = new Date(publishedAt);
                    const lastVideoAt = ch.lastVideoAt;
                    if (lastVideoAt && videoPublishedAt <= lastVideoAt) {
                        this.logger.debug(`Skip video ${videoId} - published at ${videoPublishedAt.toISOString()} is not newer than last video at ${lastVideoAt.toISOString()}`);
                        return null;
                    }
                    try {
                        await this.telegramBotService.sendNewVideoToGroup(groupId, {
                            title,
                            url: `${constants_1.YT_WATCH_BASE}${videoId}`,
                            channelId: ch.channelId,
                            channelName,
                            channelUrl,
                            thumbnail,
                            publishedAt,
                            avatarId: ch.avatarId,
                        }, botToken);
                        await this.channelModel.updateOne({ _id: ch._id }, {
                            $set: {
                                lastVideoId: videoId,
                                lastVideoAt: videoPublishedAt,
                            },
                        });
                        return { success: true, channelId: ch.channelId };
                    }
                    catch (e) {
                        const err = e;
                        this.logger.error(`Send or update failed for channel ${ch.channelId}: ${err.message}`);
                        return {
                            success: false,
                            channelId: ch.channelId,
                            error: err.message,
                        };
                    }
                });
                const results = await Promise.all(channelPromises);
                const successCount = results.filter((r) => r?.success).length;
                const failCount = results.filter((r) => r && !r.success).length;
                if (successCount > 0 || failCount > 0) {
                    this.logger.log(`Video ${videoId}: ${successCount} thành công, ${failCount} thất bại`);
                }
            }
        }
        catch (err) {
            this.logger.error(`WebSub handle failed: ${err.message}`);
        }
    }
    async subscribeCallback(topicUrl, callbackUrl) {
        const form = new URLSearchParams();
        form.append('hub.mode', 'subscribe');
        form.append('hub.topic', topicUrl);
        form.append('hub.callback', callbackUrl);
        form.append('hub.verify', 'sync');
        form.append('hub.verify_token', 'test-token');
        const res = await axios_1.default.post(constants_1.HUB_SUBSCRIBE_URL, form, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        return res.status;
    }
    async unsubscribeCallback(topicUrl, callbackUrl) {
        const form = new URLSearchParams();
        form.append('hub.mode', 'unsubscribe');
        form.append('hub.topic', topicUrl);
        form.append('hub.callback', callbackUrl);
        form.append('hub.verify', 'sync');
        form.append('hub.verify_token', 'test-token');
        const res = await axios_1.default.post(constants_1.HUB_SUBSCRIBE_URL, form, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        return res.status;
    }
};
exports.YoutubeWebsubService = YoutubeWebsubService;
exports.YoutubeWebsubService = YoutubeWebsubService = YoutubeWebsubService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(youtube_channel_schema_1.YoutubeChannel.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        telegram_bot_service_1.TelegramBotService])
], YoutubeWebsubService);
//# sourceMappingURL=youtube-websub.service.js.map