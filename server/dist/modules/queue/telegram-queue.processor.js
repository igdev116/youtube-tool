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
const redis_connection_service_1 = require("./redis-connection.service");
let TelegramQueueProcessor = TelegramQueueProcessor_1 = class TelegramQueueProcessor {
    telegramBotService;
    telegramQueueService;
    redisConnectionService;
    logger = new common_1.Logger(TelegramQueueProcessor_1.name);
    worker;
    constructor(telegramBotService, telegramQueueService, redisConnectionService) {
        this.telegramBotService = telegramBotService;
        this.telegramQueueService = telegramQueueService;
        this.redisConnectionService = redisConnectionService;
    }
    onModuleInit() {
        this.worker = new bullmq_1.Worker('telegram-queue', async (job) => {
            try {
                await this.telegramBotService.sendNewVideoToGroup(job.data.groupId, job.data.video);
                await this.telegramQueueService.resetJobCounter();
            }
            catch (error) {
                console.error(`❌ Lỗi gửi tin nhắn: ${job.id} - ${error.message}`);
                throw error;
            }
        }, {
            connection: this.redisConnectionService.getConnectionConfig(),
            concurrency: 1,
        });
        console.log('📱 Telegram queue processor đã được khởi tạo');
    }
};
exports.TelegramQueueProcessor = TelegramQueueProcessor;
exports.TelegramQueueProcessor = TelegramQueueProcessor = TelegramQueueProcessor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [telegram_bot_service_1.TelegramBotService,
        telegram_queue_service_1.TelegramQueueService,
        redis_connection_service_1.RedisConnectionService])
], TelegramQueueProcessor);
//# sourceMappingURL=telegram-queue.processor.js.map