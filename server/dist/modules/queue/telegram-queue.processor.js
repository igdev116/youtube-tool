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
var TelegramQueueProcessor1_1, TelegramQueueProcessor2_1, TelegramQueueProcessor3_1, TelegramQueueProcessor4_1, TelegramQueueProcessor5_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramQueueProcessor5 = exports.TelegramQueueProcessor4 = exports.TelegramQueueProcessor3 = exports.TelegramQueueProcessor2 = exports.TelegramQueueProcessor1 = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const telegram_bot_service_1 = require("../../telegram/telegram-bot.service");
const telegram_queue_service_1 = require("./telegram-queue.service");
let TelegramQueueProcessor1 = TelegramQueueProcessor1_1 = class TelegramQueueProcessor1 {
    telegramBotService;
    telegramQueueService;
    logger = new common_1.Logger(TelegramQueueProcessor1_1.name);
    constructor(telegramBotService, telegramQueueService) {
        this.telegramBotService = telegramBotService;
        this.telegramQueueService = telegramQueueService;
    }
    async handleSendMessage(job) {
        try {
            await this.telegramBotService.sendNewVideoToGroup(job.data.groupId, job.data.video);
            await this.telegramQueueService.resetJobCounter();
        }
        catch (error) {
            console.error(`❌ Lỗi gửi tin nhắn: ${job.id} - ${error.message}`);
            throw error;
        }
    }
};
exports.TelegramQueueProcessor1 = TelegramQueueProcessor1;
__decorate([
    (0, bull_1.Process)({ name: 'send-message-1', concurrency: 5 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramQueueProcessor1.prototype, "handleSendMessage", null);
exports.TelegramQueueProcessor1 = TelegramQueueProcessor1 = TelegramQueueProcessor1_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, bull_1.Processor)('telegram-queue'),
    __metadata("design:paramtypes", [telegram_bot_service_1.TelegramBotService,
        telegram_queue_service_1.TelegramQueueService])
], TelegramQueueProcessor1);
let TelegramQueueProcessor2 = TelegramQueueProcessor2_1 = class TelegramQueueProcessor2 {
    telegramBotService;
    telegramQueueService;
    logger = new common_1.Logger(TelegramQueueProcessor2_1.name);
    constructor(telegramBotService, telegramQueueService) {
        this.telegramBotService = telegramBotService;
        this.telegramQueueService = telegramQueueService;
    }
    async handleSendMessage(job) {
        try {
            await this.telegramBotService.sendNewVideoToGroup(job.data.groupId, job.data.video);
            await this.telegramQueueService.resetJobCounter();
        }
        catch (error) {
            console.error(`❌ Lỗi gửi tin nhắn: ${job.id} - ${error.message}`);
            throw error;
        }
    }
};
exports.TelegramQueueProcessor2 = TelegramQueueProcessor2;
__decorate([
    (0, bull_1.Process)({ name: 'send-message-2', concurrency: 5 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramQueueProcessor2.prototype, "handleSendMessage", null);
exports.TelegramQueueProcessor2 = TelegramQueueProcessor2 = TelegramQueueProcessor2_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, bull_1.Processor)('telegram-queue'),
    __metadata("design:paramtypes", [telegram_bot_service_1.TelegramBotService,
        telegram_queue_service_1.TelegramQueueService])
], TelegramQueueProcessor2);
let TelegramQueueProcessor3 = TelegramQueueProcessor3_1 = class TelegramQueueProcessor3 {
    telegramBotService;
    telegramQueueService;
    logger = new common_1.Logger(TelegramQueueProcessor3_1.name);
    constructor(telegramBotService, telegramQueueService) {
        this.telegramBotService = telegramBotService;
        this.telegramQueueService = telegramQueueService;
    }
    async handleSendMessage(job) {
        try {
            await this.telegramBotService.sendNewVideoToGroup(job.data.groupId, job.data.video);
            await this.telegramQueueService.resetJobCounter();
        }
        catch (error) {
            console.error(`❌ Lỗi gửi tin nhắn: ${job.id} - ${error.message}`);
            throw error;
        }
    }
};
exports.TelegramQueueProcessor3 = TelegramQueueProcessor3;
__decorate([
    (0, bull_1.Process)({ name: 'send-message-3', concurrency: 5 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramQueueProcessor3.prototype, "handleSendMessage", null);
exports.TelegramQueueProcessor3 = TelegramQueueProcessor3 = TelegramQueueProcessor3_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, bull_1.Processor)('telegram-queue'),
    __metadata("design:paramtypes", [telegram_bot_service_1.TelegramBotService,
        telegram_queue_service_1.TelegramQueueService])
], TelegramQueueProcessor3);
let TelegramQueueProcessor4 = TelegramQueueProcessor4_1 = class TelegramQueueProcessor4 {
    telegramBotService;
    telegramQueueService;
    logger = new common_1.Logger(TelegramQueueProcessor4_1.name);
    constructor(telegramBotService, telegramQueueService) {
        this.telegramBotService = telegramBotService;
        this.telegramQueueService = telegramQueueService;
    }
    async handleSendMessage(job) {
        try {
            await this.telegramBotService.sendNewVideoToGroup(job.data.groupId, job.data.video);
            await this.telegramQueueService.resetJobCounter();
        }
        catch (error) {
            console.error(`❌ Lỗi gửi tin nhắn: ${job.id} - ${error.message}`);
            throw error;
        }
    }
};
exports.TelegramQueueProcessor4 = TelegramQueueProcessor4;
__decorate([
    (0, bull_1.Process)({ name: 'send-message-4', concurrency: 5 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramQueueProcessor4.prototype, "handleSendMessage", null);
exports.TelegramQueueProcessor4 = TelegramQueueProcessor4 = TelegramQueueProcessor4_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, bull_1.Processor)('telegram-queue'),
    __metadata("design:paramtypes", [telegram_bot_service_1.TelegramBotService,
        telegram_queue_service_1.TelegramQueueService])
], TelegramQueueProcessor4);
let TelegramQueueProcessor5 = TelegramQueueProcessor5_1 = class TelegramQueueProcessor5 {
    telegramBotService;
    telegramQueueService;
    logger = new common_1.Logger(TelegramQueueProcessor5_1.name);
    constructor(telegramBotService, telegramQueueService) {
        this.telegramBotService = telegramBotService;
        this.telegramQueueService = telegramQueueService;
    }
    async handleSendMessage(job) {
        try {
            await this.telegramBotService.sendNewVideoToGroup(job.data.groupId, job.data.video);
            await this.telegramQueueService.resetJobCounter();
        }
        catch (error) {
            console.error(`❌ Lỗi gửi tin nhắn: ${job.id} - ${error.message}`);
            throw error;
        }
    }
};
exports.TelegramQueueProcessor5 = TelegramQueueProcessor5;
__decorate([
    (0, bull_1.Process)({ name: 'send-message-5', concurrency: 5 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramQueueProcessor5.prototype, "handleSendMessage", null);
exports.TelegramQueueProcessor5 = TelegramQueueProcessor5 = TelegramQueueProcessor5_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, bull_1.Processor)('telegram-queue'),
    __metadata("design:paramtypes", [telegram_bot_service_1.TelegramBotService,
        telegram_queue_service_1.TelegramQueueService])
], TelegramQueueProcessor5);
//# sourceMappingURL=telegram-queue.processor.js.map