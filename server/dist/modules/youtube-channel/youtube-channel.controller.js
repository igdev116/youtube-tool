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
exports.YoutubeChannelController = void 0;
const common_1 = require("@nestjs/common");
const youtube_channel_service_1 = require("./youtube-channel.service");
const get_channels_dto_1 = require("./dto/get-channels.dto");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
let YoutubeChannelController = class YoutubeChannelController {
    channelService;
    constructor(channelService) {
        this.channelService = channelService;
    }
    addChannelsBulk(body, req) {
        const user = req.user;
        const userId = user.sub;
        const result = this.channelService.addChannelsBulk(body, userId);
        if (result.error) {
            return {
                success: false,
                statusCode: 400,
                message: result.message || 'Thêm kênh thất bại',
                result: null,
            };
        }
        return {
            success: true,
            statusCode: 201,
            message: 'Đã thêm danh sách kênh thành công',
            result: result.docs,
        };
    }
    async getUserChannels(req, body) {
        const user = req.user;
        const userId = user.sub;
        const pageNum = Number(body.page) || 1;
        const pageSize = Number(body.limit) || 10;
        const pagingResult = await this.channelService.getUserChannelsWithPagination(userId, pageNum, pageSize, body.keyword, body.sort, !!body.favoriteOnly);
        return {
            success: true,
            statusCode: 200,
            message: 'Lấy danh sách kênh thành công',
            result: pagingResult.result,
        };
    }
    async deleteAllUserChannels(req) {
        const user = req.user;
        const userId = user.sub;
        const { deletedCount } = await this.channelService.deleteAllUserChannels(userId);
        return {
            success: true,
            statusCode: 200,
            message: `Đã xoá ${deletedCount} kênh của bạn`,
            result: { deletedCount },
        };
    }
    async deleteChannel(id, req) {
        const user = req.user;
        const userId = user.sub;
        const deleted = await this.channelService.deleteChannelById(userId, id);
        if (!deleted) {
            return {
                success: false,
                statusCode: 404,
                message: 'Không tìm thấy kênh hoặc bạn không có quyền xoá',
                result: null,
            };
        }
        return {
            success: true,
            statusCode: 200,
            message: 'Xoá kênh thành công',
            result: deleted,
        };
    }
    async toggleChannelActive(id, req) {
        const user = req.user;
        const userId = user.sub;
        const channel = await this.channelService.toggleChannelActive(userId, id);
        if (!channel) {
            return {
                success: false,
                statusCode: 404,
                message: 'Không tìm thấy kênh hoặc bạn không có quyền thay đổi',
                result: null,
            };
        }
        return {
            success: true,
            statusCode: 200,
            message: `Đã ${channel.isActive ? 'bật' : 'tắt'} kênh thành công`,
            result: channel,
        };
    }
};
exports.YoutubeChannelController = YoutubeChannelController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('bulk'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Object)
], YoutubeChannelController.prototype, "addChannelsBulk", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('list'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, get_channels_dto_1.GetChannelsDto]),
    __metadata("design:returntype", Promise)
], YoutubeChannelController.prototype, "getUserChannels", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)('all'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], YoutubeChannelController.prototype, "deleteAllUserChannels", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], YoutubeChannelController.prototype, "deleteChannel", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(':id/toggle'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], YoutubeChannelController.prototype, "toggleChannelActive", null);
exports.YoutubeChannelController = YoutubeChannelController = __decorate([
    (0, common_1.Controller)('channel'),
    __metadata("design:paramtypes", [youtube_channel_service_1.YoutubeChannelService])
], YoutubeChannelController);
//# sourceMappingURL=youtube-channel.controller.js.map