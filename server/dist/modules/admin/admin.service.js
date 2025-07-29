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
let AdminService = class AdminService {
    channelModel;
    constructor(channelModel) {
        this.channelModel = channelModel;
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
        const channelsWithErrors = await this.channelModel.countDocuments({
            errors: { $exists: true, $ne: [] },
        });
        return {
            success: true,
            message: 'Thống kê channels',
            result: {
                totalChannels,
                activeChannels,
                channelsWithErrors,
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
    async deleteAllChannelsWithErrors() {
        const result = await this.channelModel.deleteMany({
            errors: { $exists: true, $ne: [] },
        });
        console.log(`🗑️ Admin đã xóa ${result.deletedCount} channels có lỗi`);
        return {
            success: true,
            message: `Đã xóa ${result.deletedCount} channels có lỗi`,
            deletedCount: result.deletedCount,
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(youtube_channel_schema_1.YoutubeChannel.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AdminService);
//# sourceMappingURL=admin.service.js.map