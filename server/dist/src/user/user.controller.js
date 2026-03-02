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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let UserController = class UserController {
    userService;
    constructor(userService) {
        this.userService = userService;
    }
    async getProfile(req) {
        const user = req.user;
        const userId = user.sub;
        const profile = await this.userService.getProfile(userId);
        return {
            success: true,
            statusCode: 200,
            message: 'Lấy thông tin người dùng thành công',
            result: profile,
        };
    }
    async getFavorites(req) {
        const user = req.user;
        const userId = user.sub;
        const list = await this.userService.getFavoriteChannels(userId);
        return {
            success: true,
            statusCode: 200,
            message: 'Lấy danh sách kênh yêu thích thành công',
            result: list,
        };
    }
    async addFavorite(req, body) {
        const user = req.user;
        const userId = user.sub;
        const updated = await this.userService.addFavoriteChannel(userId, body.channelId);
        return {
            success: true,
            statusCode: 200,
            message: 'Đã thêm kênh vào yêu thích',
            result: updated?.favoriteChannelIds ?? [],
        };
    }
    async removeFavorite(req, channelId) {
        const user = req.user;
        const userId = user.sub;
        const updated = await this.userService.removeFavoriteChannel(userId, channelId);
        return {
            success: true,
            statusCode: 200,
            message: 'Đã xoá kênh khỏi yêu thích',
            result: updated?.favoriteChannelIds ?? [],
        };
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('favorites'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getFavorites", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('favorites'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "addFavorite", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)('favorites'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('channelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "removeFavorite", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)('user'),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
//# sourceMappingURL=user.controller.js.map