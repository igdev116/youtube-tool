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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
const get_users_dto_1 = require("./dto/get-users.dto");
const get_user_channels_dto_1 = require("./dto/get-user-channels.dto");
let AdminController = class AdminController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    async deleteAllChannels() {
        const result = await this.adminService.deleteAllChannels();
        return {
            success: true,
            statusCode: 200,
            message: result.message,
            result: {
                deletedCount: result.deletedCount,
            },
        };
    }
    async getChannelStats() {
        const result = await this.adminService.getChannelStats();
        return {
            success: true,
            statusCode: 200,
            message: result.message,
            result: result.result,
        };
    }
    async resetAllLastVideoId() {
        const result = await this.adminService.resetAllLastVideoId();
        return {
            success: true,
            statusCode: 200,
            message: result.message,
            result: {
                modifiedCount: result.modifiedCount,
            },
        };
    }
    async getUsersList(params) {
        const result = await this.adminService.getUsersList(params);
        return {
            success: true,
            statusCode: 200,
            message: result.message,
            result: result.result,
        };
    }
    async getUser(userId) {
        const user = await this.adminService.getUserById(userId);
        if (!user) {
            return {
                success: false,
                statusCode: 404,
                message: 'User không tồn tại',
                result: null,
            };
        }
        return {
            success: true,
            statusCode: 200,
            message: 'Lấy thông tin user thành công',
            result: user,
        };
    }
    async getUserChannels(userId, params) {
        const result = await this.adminService.getUserChannels(userId, params);
        return {
            ...result,
        };
    }
    async deleteUserChannel(userId, channelId) {
        const result = await this.adminService.deleteUserChannel(userId, channelId);
        return {
            success: result.success,
            statusCode: result.success ? 200 : 400,
            message: result.message,
            result: null,
        };
    }
    async deleteUser(userId) {
        const result = await this.adminService.deleteUser(userId);
        return {
            success: true,
            statusCode: 200,
            message: result.message,
            result: {
                deletedChannels: result.deletedChannels,
                deletedUser: result.deletedUser,
            },
        };
    }
    async migrateUserField() {
        const result = await this.adminService.migrateUserFieldToObjectId();
        return {
            success: true,
            statusCode: 200,
            message: result.message,
            result: {
                count: result.count,
            },
        };
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Post)('delete-all-channels'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteAllChannels", null);
__decorate([
    (0, common_1.Get)('channel-stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getChannelStats", null);
__decorate([
    (0, common_1.Post)('reset-last-video-id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "resetAllLastVideoId", null);
__decorate([
    (0, common_1.Post)('users'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_users_dto_1.GetUsersDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUsersList", null);
__decorate([
    (0, common_1.Get)('users/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUser", null);
__decorate([
    (0, common_1.Get)('users/:userId/channels'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, get_user_channels_dto_1.GetUserChannelsDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUserChannels", null);
__decorate([
    (0, common_1.Delete)('users/:userId/channels/:channelId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('channelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteUserChannel", null);
__decorate([
    (0, common_1.Delete)('users/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Post)('migrate-user-objectid'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "migrateUserField", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map