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
exports.TelegramGroupController = void 0;
const common_1 = require("@nestjs/common");
const telegram_group_service_1 = require("./telegram-group.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const create_group_dto_1 = require("./dto/create-group.dto");
const update_group_dto_1 = require("./dto/update-group.dto");
let TelegramGroupController = class TelegramGroupController {
    groupService;
    constructor(groupService) {
        this.groupService = groupService;
    }
    async createGroup(dto, req) {
        const userId = req.user.sub;
        const group = await this.groupService.createGroup(userId, dto);
        return {
            success: true,
            statusCode: 201,
            message: 'Tạo group thành công',
            result: group,
        };
    }
    async getUserGroups(req) {
        const userId = req.user.sub;
        const groups = await this.groupService.getUserGroups(userId);
        return {
            success: true,
            statusCode: 200,
            message: 'Lấy danh sách groups thành công',
            result: groups,
        };
    }
    async updateGroup(groupId, dto, req) {
        const userId = req.user.sub;
        const group = await this.groupService.updateGroup(userId, groupId, dto);
        return {
            success: true,
            statusCode: 200,
            message: 'Cập nhật group thành công',
            result: group,
        };
    }
    async deleteGroup(groupId, req) {
        const userId = req.user.sub;
        await this.groupService.deleteGroup(userId, groupId);
        return {
            success: true,
            statusCode: 200,
            message: 'Xóa group thành công',
            result: null,
        };
    }
    async addChannels(groupId, body, req) {
        const userId = req.user.sub;
        const group = await this.groupService.addChannels(userId, groupId, body.channelIds);
        return {
            success: true,
            statusCode: 200,
            message: 'Thêm kênh vào group thành công',
            result: group,
        };
    }
    async removeChannel(groupId, channelId, req) {
        const userId = req.user.sub;
        const group = await this.groupService.removeChannel(userId, groupId, channelId);
        return {
            success: true,
            statusCode: 200,
            message: 'Xóa kênh khỏi group thành công',
            result: group,
        };
    }
};
exports.TelegramGroupController = TelegramGroupController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_group_dto_1.CreateGroupDto, Object]),
    __metadata("design:returntype", Promise)
], TelegramGroupController.prototype, "createGroup", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramGroupController.prototype, "getUserGroups", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_group_dto_1.UpdateGroupDto, Object]),
    __metadata("design:returntype", Promise)
], TelegramGroupController.prototype, "updateGroup", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TelegramGroupController.prototype, "deleteGroup", null);
__decorate([
    (0, common_1.Post)(':id/channels'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TelegramGroupController.prototype, "addChannels", null);
__decorate([
    (0, common_1.Delete)(':id/channels/:channelId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('channelId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TelegramGroupController.prototype, "removeChannel", null);
exports.TelegramGroupController = TelegramGroupController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('groups'),
    __metadata("design:paramtypes", [telegram_group_service_1.TelegramGroupService])
], TelegramGroupController);
//# sourceMappingURL=telegram-group.controller.js.map