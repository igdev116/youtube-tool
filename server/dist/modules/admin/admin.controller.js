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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
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
    async deleteAllChannelsWithErrors() {
        const result = await this.adminService.deleteAllChannelsWithErrors();
        return {
            success: true,
            statusCode: 200,
            message: result.message,
            result: {
                deletedCount: result.deletedCount,
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
    (0, common_1.Post)('delete-channels-with-errors'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteAllChannelsWithErrors", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map