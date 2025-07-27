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
var TelegramQueueProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramQueueProcessor = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("bullmq");
const telegram_bot_service_1 = require("../../telegram/telegram-bot.service");
const telegram_queue_service_1 = require("./telegram-queue.service");
let TelegramQueueProcessor = TelegramQueueProcessor_1 = class TelegramQueueProcessor {
    telegramBotService;
    telegramQueueService;
    logger = new common_1.Logger(TelegramQueueProcessor_1.name);
    worker;
    constructor(telegramBotService, telegramQueueService) {
        this.telegramBotService = telegramBotService;
        this.telegramQueueService = telegramQueueService;
    }
    onModuleInit() {
        this.worker = new bullmq_1.Worker('telegram-queue', async (job) => {
            console.log(`📱 Đang gửi tin nhắn Telegram: ${job.id}`);
            try {
                await this.telegramBotService.sendNewVideoToGroup(job.data.groupId, job.data.video);
                console.log(`✅ Đã gửi tin nhắn thành công: ${job.id}`);
                await this.telegramQueueService.resetJobCounter();
            }
            catch (error) {
                console.error(`❌ Lỗi gửi tin nhắn: ${job.id} - ${error.message}`);
                throw error;
            }
        }, {
            connection: {
                host: process.env.REDIS_HOST,
                port: Number(process.env.REDIS_PORT ?? 6379),
                password: process.env.REDIS_PASSWORD,
                username: process.env.REDIS_USERNAME,
            },
            concurrency: 1,
        });
        this.worker.on('completed', (job) => {
            console.log(`Job ${job.id} completed`);
            console.log('--------------------------------');
        });
        this.worker.on('failed', (job, err) => {
            console.error(`Job ${job?.id} failed: ${err.message}`);
        });
    }
};
exports.TelegramQueueProcessor = TelegramQueueProcessor;
exports.TelegramQueueProcessor = TelegramQueueProcessor = TelegramQueueProcessor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [telegram_bot_service_1.TelegramBotService,
        telegram_queue_service_1.TelegramQueueService])
], TelegramQueueProcessor);
//# sourceMappingURL=telegram-queue.processor.js.map