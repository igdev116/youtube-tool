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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const youtube_channel_schema_1 = require("../youtube-channel/youtube-channel.schema");
const user_schema_1 = require("../../user/user.schema");
const pagination_util_1 = require("../../utils/pagination.util");
let AdminService = class AdminService {
    channelModel;
    userModel;
    constructor(channelModel, userModel) {
        this.channelModel = channelModel;
        this.userModel = userModel;
    }
    async deleteAllChannels() {
        const result = await this.channelModel.deleteMany({});
        console.log(`🗑️ Admin đã xóa ${result.deletedCount} channels`);
        return {
            success: true,
            message: `Đã xóa ${result.deletedCount} channels`,
            deletedCount: result.deletedCount,
        };
    }
    async getChannelStats() {
        const totalChannels = await this.channelModel.countDocuments({});
        const activeChannels = await this.channelModel.countDocuments({
            isActive: true,
        });
        return {
            success: true,
            message: 'Thống kê channels',
            result: {
                totalChannels,
                activeChannels,
                inactiveChannels: totalChannels - activeChannels,
            },
        };
    }
    async resetAllLastVideoId() {
        const result = await this.channelModel.updateMany({}, {
            $unset: { lastVideoId: 1, lastVideoAt: 1 },
        });
        console.log(`🔄 Admin đã reset lastVideoId cho ${result.modifiedCount} channels`);
        return {
            success: true,
            message: `Đã reset lastVideoId cho ${result.modifiedCount} channels`,
            modifiedCount: result.modifiedCount,
        };
    }
    async getUsersList(params) {
        const { page = 1, limit = 10, keyword } = params;
        const skip = (page - 1) * limit;
        const searchFilter = {};
        if (keyword) {
            searchFilter.username = { $regex: keyword, $options: 'i' };
        }
        const usersWithCount = await this.userModel.aggregate([
            { $match: searchFilter },
            {
                $lookup: {
                    from: 'youtubechannels',
                    localField: '_id',
                    foreignField: 'user',
                    as: 'channels',
                },
            },
            {
                $addFields: {
                    channelCount: { $size: '$channels' },
                },
            },
            {
                $project: {
                    channels: 0,
                },
            },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
        ]);
        const total = await this.userModel.countDocuments(searchFilter);
        return {
            success: true,
            message: 'Lấy danh sách users thành công',
            result: {
                content: usersWithCount,
                paging: {
                    total,
                    hasMore: skip + limit < total,
                },
            },
        };
    }
    async getUserById(userId) {
        const userObjectId = new mongoose_2.Types.ObjectId(userId);
        const users = await this.userModel.aggregate([
            { $match: { _id: userObjectId } },
            {
                $lookup: {
                    from: 'youtubechannels',
                    localField: '_id',
                    foreignField: 'user',
                    as: 'channels',
                },
            },
            {
                $addFields: {
                    channelCount: { $size: '$channels' },
                },
            },
            {
                $project: {
                    channels: 0,
                },
            },
        ]);
        return users[0] || null;
    }
    async getUserChannels(userId, params) {
        const { page = 1, limit = 10, keyword } = params;
        const userObjectId = new mongoose_2.Types.ObjectId(userId);
        const query = { user: userObjectId };
        if (keyword) {
            query.channelId = { $regex: keyword, $options: 'i' };
        }
        const result = await (0, pagination_util_1.paginateWithPage)(this.channelModel, query, page, limit, { createdAt: -1 });
        return {
            ...result,
            message: 'Lấy danh sách channels thành công',
        };
    }
    async deleteUser(userId) {
        const userObjectId = new mongoose_2.Types.ObjectId(userId);
        const channelResult = await this.channelModel.deleteMany({
            user: userObjectId,
        });
        const userResult = await this.userModel.deleteOne({ _id: userId });
        console.log(`🗑️ Admin đã xóa user ${userId} và ${channelResult.deletedCount} channels`);
        return {
            success: true,
            message: `Đã xóa user và ${channelResult.deletedCount} channels liên quan`,
            deletedChannels: channelResult.deletedCount,
            deletedUser: userResult.deletedCount,
        };
    }
    async deleteUserChannel(userId, channelId) {
        const userObjectId = new mongoose_2.Types.ObjectId(userId);
        const channelObjectId = new mongoose_2.Types.ObjectId(channelId);
        const deleted = await this.channelModel.findOneAndDelete({
            _id: channelObjectId,
            user: userObjectId,
        });
        if (deleted) {
            console.log(`🗑️ Admin đã xóa channel ${channelId} của user ${userId}`);
            return {
                success: true,
                message: 'Đã xóa channel thành công',
            };
        }
        return {
            success: false,
            message: 'Không tìm thấy channel hoặc channel không thuộc về user này',
        };
    }
    async migrateUserFieldToObjectId() {
        const channels = await this.channelModel
            .find({
            user: { $type: 'string' },
        })
            .lean();
        let migratedCount = 0;
        for (const channel of channels) {
            const userStr = channel.user;
            if (mongoose_2.Types.ObjectId.isValid(userStr)) {
                await this.channelModel.updateOne({ _id: channel._id }, { $set: { user: new mongoose_2.Types.ObjectId(userStr) } });
                migratedCount++;
            }
        }
        console.log(`🚀 Đã migrate ${migratedCount} channels sang ObjectId`);
        return {
            success: true,
            message: `Đã migrate thành công ${migratedCount} channels`,
            count: migratedCount,
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(youtube_channel_schema_1.YoutubeChannel.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], AdminService);
//# sourceMappingURL=admin.service.js.map