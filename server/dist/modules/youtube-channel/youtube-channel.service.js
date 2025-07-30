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
exports.YoutubeChannelService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const youtube_channel_schema_1 = require("./youtube-channel.schema");
const youtube_channel_utils_1 = require("./youtube-channel.utils");
const pagination_util_1 = require("../../utils/pagination.util");
const youtube_channel_utils_2 = require("./youtube-channel.utils");
const user_service_1 = require("../../user/user.service");
const telegram_bot_service_1 = require("../../telegram/telegram-bot.service");
const p_limit_1 = require("p-limit");
const telegram_queue_service_1 = require("../queue/telegram-queue.service");
let YoutubeChannelService = class YoutubeChannelService {
    channelModel;
    userService;
    telegramBotService;
    telegramQueueService;
    constructor(channelModel, userService, telegramBotService, telegramQueueService) {
        this.channelModel = channelModel;
        this.userService = userService;
        this.telegramBotService = telegramBotService;
        this.telegramQueueService = telegramQueueService;
    }
    async addChannelError(channel, errorType) {
        const updateData = {};
        const currentErrors = channel.errors || [];
        if (!currentErrors.includes(errorType)) {
            updateData.$addToSet = { errors: errorType };
        }
        if (errorType === youtube_channel_schema_1.ChannelErrorType.LINK_ERROR) {
            updateData.isActive = false;
        }
        if (Object.keys(updateData).length > 0) {
            await this.channelModel.updateOne({ _id: channel._id }, updateData);
        }
    }
    async addChannelsBulk(channels, userId) {
        const errorLinks = [];
        const docs = [];
        const limit = (0, p_limit_1.default)(100);
        const tasks = channels.map((item) => limit(async () => {
            const channelId = await (0, youtube_channel_utils_1.extractChannelIdFromUrl)(item.link);
            if (!channelId) {
                errorLinks.push({ link: item.link, reason: 'không hợp lệ' });
                return;
            }
            const existingChannel = await this.channelModel.findOne({
                channelId,
                user: userId,
            });
            if (existingChannel) {
                errorLinks.push({ link: item.link, reason: 'đã tồn tại' });
                return;
            }
            try {
                const doc = await this.channelModel.create({
                    channelId,
                    isActive: item.isActive ?? true,
                    user: userId,
                });
                docs.push(doc);
            }
            catch {
                errorLinks.push({ link: item.link, reason: 'lỗi khi lưu vào DB' });
            }
        }));
        await Promise.all(tasks);
        let message = '';
        if (errorLinks.length > 0) {
            message = errorLinks.map((e) => `Link ${e.link} ${e.reason}`).join(', ');
        }
        return { error: errorLinks.length > 0, message, docs };
    }
    async getUserChannelsWithPagination(userId, page, limit, keyword) {
        const filter = { user: userId };
        if (keyword) {
            filter.channelId = { $regex: keyword, $options: 'i' };
        }
        return (0, pagination_util_1.paginateWithPage)(this.channelModel, filter, page, limit, { _id: 1 });
    }
    async deleteChannelById(userId, id) {
        const deleted = await this.channelModel.findOneAndDelete({
            _id: id,
            user: userId,
        });
        return deleted;
    }
    async toggleChannelActive(userId, id) {
        const channel = await this.channelModel.findOne({
            _id: id,
            user: userId,
        });
        if (!channel) {
            return null;
        }
        channel.isActive = !channel.isActive;
        await channel.save();
        return channel;
    }
    async testCheckNewVideo() {
        return await this.notifyAllChannelsNewVideo();
    }
    async notifyAllChannelsNewVideo() {
        const activeChannels = await this.channelModel
            .find({ isActive: true })
            .populate('user')
            .exec();
        const limit = (0, p_limit_1.default)(3);
        const processingChannels = new Set();
        const tasks = activeChannels.map((channel) => limit(async () => {
            if (processingChannels.has(channel.channelId)) {
                return;
            }
            processingChannels.add(channel.channelId);
            try {
                const url = `https://www.youtube.com/${channel.channelId}`;
                const latestVideo = await (0, youtube_channel_utils_2.extractFirstVideoIdFromYt)(url);
                if (latestVideo && latestVideo.id !== channel.lastVideoId) {
                    let telegramGroupId;
                    const user = channel.user;
                    if (user && 'telegramGroupId' in user) {
                        telegramGroupId = user.telegramGroupId;
                    }
                    const updatedChannel = await this.channelModel.findOneAndUpdate({
                        _id: channel._id,
                        $or: [
                            { lastVideoId: { $exists: false } },
                            { lastVideoId: null },
                            { lastVideoId: { $ne: latestVideo.id } },
                        ],
                    }, {
                        $set: {
                            lastVideoId: latestVideo.id,
                            lastVideoAt: new Date(),
                        },
                    }, { new: true });
                    if (updatedChannel) {
                        if (telegramGroupId) {
                            await this.telegramQueueService.addTelegramMessageJob({
                                groupId: telegramGroupId,
                                video: {
                                    title: latestVideo.title || '',
                                    url: `https://www.youtube.com/watch?v=${latestVideo.id}`,
                                    thumbnail: latestVideo.thumbnail,
                                    channelId: channel.channelId,
                                },
                            });
                        }
                    }
                }
                else if (!latestVideo) {
                    await this.addChannelError(channel, youtube_channel_schema_1.ChannelErrorType.SHORT_NOT_FOUND);
                }
            }
            catch (error) {
                console.log('error :', error);
                await this.addChannelError(channel, youtube_channel_schema_1.ChannelErrorType.NETWORK_ERROR);
            }
            finally {
                processingChannels.delete(channel.channelId);
            }
        }));
        await Promise.all(tasks);
    }
};
exports.YoutubeChannelService = YoutubeChannelService;
exports.YoutubeChannelService = YoutubeChannelService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(youtube_channel_schema_1.YoutubeChannel.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        user_service_1.UserService,
        telegram_bot_service_1.TelegramBotService,
        telegram_queue_service_1.TelegramQueueService])
], YoutubeChannelService);
//# sourceMappingURL=youtube-channel.service.js.map