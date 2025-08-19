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
const user_service_1 = require("../../user/user.service");
const constants_1 = require("../../constants");
dayjs.extend(utc);
dayjs.extend(timezone);
let YoutubeChannelService = YoutubeChannelService_1 = class YoutubeChannelService {
    channelModel;
    websubService;
    userService;
    logger = new common_1.Logger(YoutubeChannelService_1.name);
    constructor(channelModel, websubService, userService) {
        this.channelModel = channelModel;
        this.websubService = websubService;
        this.userService = userService;
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
            const channelResult = await (0, youtube_channel_utils_1.extractChannelDataFromUrl)(item.link);
            if (!channelResult) {
                return;
            }
            const { channelId, avatarId } = channelResult;
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
                const created = await this.channelModel.create({
                    channelId,
                    xmlChannelId,
                    avatarId,
                    isActive: item.isActive ?? true,
                    user: userId,
                    lastVideoId: latestVideoId,
                    lastVideoAt: latestPublishedAtDate,
                });
                const topicUrl = `${constants_1.YT_FEED_BASE}?channel_id=${xmlChannelId}`;
                const callbackUrl = `${process.env.API_URL}/websub/youtube/callback`;
                try {
                    await this.websubService.subscribeCallback(topicUrl, callbackUrl, constants_1.HUB_LEASE_SECONDS);
                    await this.channelModel.updateOne({ _id: created._id }, { $set: { lastSubscribeAt: new Date() } });
                }
                catch (err) {
                    const status = err?.response?.status;
                    if (status === 409) {
                        await this.channelModel.updateOne({ _id: created._id }, { $set: { lastSubscribeAt: new Date() } });
                    }
                    else {
                        throw err;
                    }
                }
            }
            catch (err) {
                this.logger.error(`Failed to create/subscribe channel ${channelId}: ${err.message}`);
            }
        }));
        await Promise.all(tasks);
    }
    async getUserChannelsWithPagination(userId, page, limit, keyword, sortKey, favoriteOnly) {
        const filter = { user: userId };
        if (keyword) {
            filter.channelId = { $regex: keyword, $options: 'i' };
        }
        if (favoriteOnly) {
            const favoriteIds = await this.userService.getFavoriteChannels(userId);
            const validObjectIds = (favoriteIds || [])
                .filter((id) => mongoose_2.Types.ObjectId.isValid(id))
                .map((id) => new mongoose_2.Types.ObjectId(id));
            if (validObjectIds.length === 0) {
                return (0, pagination_util_1.paginateWithPage)(this.channelModel, { _id: { $in: [] } }, page, limit, this.mapSort(sortKey));
            }
            filter._id = { $in: validObjectIds };
        }
        const sort = this.mapSort(sortKey);
        return (0, pagination_util_1.paginateWithPage)(this.channelModel, filter, page, limit, sort);
    }
    mapSort(sortKey) {
        switch (sortKey) {
            case youtube_channel_schema_1.YoutubeChannelSort.NEWEST_UPLOAD:
                return { lastVideoAt: -1, _id: -1 };
            case youtube_channel_schema_1.YoutubeChannelSort.OLDEST_CHANNEL:
                return { _id: 1 };
            case youtube_channel_schema_1.YoutubeChannelSort.NEWEST_CHANNEL:
            default:
                return { _id: -1 };
        }
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
                    const callbackUrl = `${process.env.API_URL}/websub/youtube/callback`;
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
    async deleteAllUserChannels(userId) {
        const userChannels = await this.channelModel
            .find({ user: userId }, { xmlChannelId: 1 })
            .lean()
            .exec();
        const xmlIds = Array.from(new Set((userChannels || []).map((c) => c.xmlChannelId).filter(Boolean)));
        const result = await this.channelModel.deleteMany({ user: userId });
        for (const xmlId of xmlIds) {
            try {
                const remaining = await this.channelModel.countDocuments({
                    xmlChannelId: xmlId,
                });
                if (remaining === 0) {
                    const topicUrl = `${constants_1.YT_FEED_BASE}?channel_id=${xmlId}`;
                    const callbackUrl = `${process.env.API_URL}/websub/youtube/callback`;
                    await this.websubService.unsubscribeCallback(topicUrl, callbackUrl);
                }
            }
            catch {
            }
        }
        return { deletedCount: result.deletedCount ?? 0 };
    }
    async getAllUserChannels(userId) {
        return this.channelModel.find({ user: userId }).lean().exec();
    }
};
exports.YoutubeChannelService = YoutubeChannelService;
exports.YoutubeChannelService = YoutubeChannelService = YoutubeChannelService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(youtube_channel_schema_1.YoutubeChannel.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        youtube_websub_service_1.YoutubeWebsubService,
        user_service_1.UserService])
], YoutubeChannelService);
//# sourceMappingURL=youtube-channel.service.js.map