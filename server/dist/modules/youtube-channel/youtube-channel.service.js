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
var YoutubeChannelService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.YoutubeChannelService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const youtube_channel_schema_1 = require("./youtube-channel.schema");
const youtube_channel_utils_1 = require("./youtube-channel.utils");
const pagination_util_1 = require("../../utils/pagination.util");
const youtube_channel_utils_2 = require("./youtube-channel.utils");
const p_limit_1 = require("p-limit");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const youtube_websub_service_1 = require("../websub/youtube-websub.service");
const constants_1 = require("../../constants");
dayjs.extend(utc);
dayjs.extend(timezone);
let YoutubeChannelService = YoutubeChannelService_1 = class YoutubeChannelService {
    channelModel;
    websubService;
    logger = new common_1.Logger(YoutubeChannelService_1.name);
    constructor(channelModel, websubService) {
        this.channelModel = channelModel;
        this.websubService = websubService;
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
    addChannelsBulk(channels, userId) {
        setTimeout(() => {
            void this.processChannelsBulk(channels, userId).catch(() => undefined);
        }, 0);
        return {
            error: false,
            message: 'Đã nhận danh sách, hệ thống sẽ xử lý nền',
            docs: [],
        };
    }
    async processChannelsBulk(channels, userId) {
        const maxConcurrency = Number(process.env.BULK_CONCURRENCY || 3);
        const limit = (0, p_limit_1.default)(Math.max(1, maxConcurrency));
        const tasks = channels.map((item) => limit(async () => {
            const xmlChannelId = await (0, youtube_channel_utils_1.extractXmlChannelIdFromUrl)(item.link);
            if (!xmlChannelId) {
                return;
            }
            const channelId = await (0, youtube_channel_utils_1.extractChannelIdFromUrl)(item.link);
            const existingChannel = await this.channelModel.findOne({
                channelId,
                user: userId,
            });
            if (existingChannel) {
                return;
            }
            let latestVideoId;
            let latestPublishedAtDate;
            try {
                const latestVideo = await (0, youtube_channel_utils_2.extractFirstVideoFromYt)(xmlChannelId);
                if (latestVideo && latestVideo.id) {
                    latestVideoId = latestVideo.id;
                    latestPublishedAtDate = latestVideo.publishedAt
                        ? dayjs
                            .utc(latestVideo.publishedAt)
                            .tz('Asia/Ho_Chi_Minh')
                            .toDate()
                        : undefined;
                }
            }
            catch {
            }
            try {
                await this.channelModel.create({
                    channelId,
                    xmlChannelId,
                    isActive: item.isActive ?? true,
                    user: userId,
                    ...(latestVideoId
                        ? {
                            lastVideoId: latestVideoId,
                            lastVideoAt: latestPublishedAtDate ?? new Date(),
                        }
                        : {
                            lastVideoId: 'INIT',
                            lastVideoAt: new Date(0),
                        }),
                });
                const topicUrl = `${constants_1.YT_FEED_BASE}?channel_id=${xmlChannelId}`;
                const callbackUrl = `${process.env.APP_URL}/websub/youtube/callback`;
                await this.websubService.subscribeCallback(topicUrl, callbackUrl);
            }
            catch {
            }
        }));
        await Promise.all(tasks);
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
        if (deleted) {
            try {
                const remaining = await this.channelModel.countDocuments({
                    xmlChannelId: deleted.xmlChannelId,
                });
                if (remaining === 0) {
                    const topicUrl = `${constants_1.YT_FEED_BASE}?channel_id=${deleted.xmlChannelId}`;
                    const callbackUrl = `${process.env.APP_URL}/websub/youtube/callback`;
                    await this.websubService.unsubscribeCallback(topicUrl, callbackUrl);
                }
            }
            catch {
            }
        }
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
};
exports.YoutubeChannelService = YoutubeChannelService;
exports.YoutubeChannelService = YoutubeChannelService = YoutubeChannelService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(youtube_channel_schema_1.YoutubeChannel.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        youtube_websub_service_1.YoutubeWebsubService])
], YoutubeChannelService);
//# sourceMappingURL=youtube-channel.service.js.map