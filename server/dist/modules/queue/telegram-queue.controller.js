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
exports.TelegramQueueController = void 0;
const common_1 = require("@nestjs/common");
const telegram_queue_service_1 = require("./telegram-queue.service");
let TelegramQueueController = class TelegramQueueController {
    telegramQueueService;
    constructor(telegramQueueService) {
        this.telegramQueueService = telegramQueueService;
    }
    async getStatus() {
        const status = await this.telegramQueueService.getQueueStatus();
        return {
            success: true,
            status,
        };
    }
    async clearQueue() {
        await this.telegramQueueService.clearQueue();
        return {
            success: true,
            message: 'Đã xóa tất cả jobs trong telegram queue',
        };
    }
    async addTestJob() {
        await this.telegramQueueService.addTelegramMessageJob({
            groupId: '-4943686852',
            video: {
                title: 'Test Telegram Job',
                url: 'https://youtube.com/watch?v=test',
                thumbnail: 'https://via.placeholder.com/300x200',
                channelId: 'test-channel',
            },
        });
        return {
            success: true,
            message: 'Đã thêm job test vào telegram queue',
        };
    }
    async resetCounter() {
        await this.telegramQueueService.resetJobCounter();
        return {
            success: true,
            message: 'Đã reset jobCounter',
        };
    }
};
exports.TelegramQueueController = TelegramQueueController;
__decorate([
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TelegramQueueController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Post)('clear'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TelegramQueueController.prototype, "clearQueue", null);
__decorate([
    (0, common_1.Post)('test'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TelegramQueueController.prototype, "addTestJob", null);
__decorate([
    (0, common_1.Post)('reset-counter'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TelegramQueueController.prototype, "resetCounter", null);
exports.TelegramQueueController = TelegramQueueController = __decorate([
    (0, common_1.Controller)('telegram-queue'),
    __metadata("design:paramtypes", [telegram_queue_service_1.TelegramQueueService])
], TelegramQueueController);
//# sourceMappingURL=telegram-queue.controller.js.map