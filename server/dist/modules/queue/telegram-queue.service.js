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
exports.TelegramQueueService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("bullmq");
const redis_connection_service_1 = require("./redis-connection.service");
let TelegramQueueService = class TelegramQueueService {
    redisConnectionService;
    telegramQueue;
    constructor(redisConnectionService) {
        this.redisConnectionService = redisConnectionService;
    }
    async onModuleInit() {
        this.telegramQueue = new bullmq_1.Queue('telegram-queue', {
            connection: this.redisConnectionService.getConnectionConfig(),
            defaultJobOptions: {
                removeOnComplete: true,
                removeOnFail: 3,
            },
        });
        await this.clearQueue();
        console.log('🧹 Đã clear telegram queue khi start server');
    }
    jobCounter = 0;
    async addTelegramMessageJob(jobData) {
        await this.telegramQueue.add('send-message', jobData, {
            delay: this.jobCounter * 5000,
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 2000,
            },
        });
        this.jobCounter++;
    }
    async resetJobCounter() {
        const waiting = await this.telegramQueue.getWaiting();
        const active = await this.telegramQueue.getActive();
        if (waiting.length === 0 && active.length === 0) {
            this.jobCounter = 0;
            console.log('🔄 Reset jobCounter về 0 vì queue đã trống');
        }
    }
    async getQueueStatus() {
        const waiting = await this.telegramQueue.getWaiting();
        const active = await this.telegramQueue.getActive();
        const completed = await this.telegramQueue.getCompleted();
        const failed = await this.telegramQueue.getFailed();
        return {
            waiting: waiting.length,
            active: active.length,
            completed: completed.length,
            failed: failed.length,
            total: waiting.length + active.length + completed.length + failed.length,
        };
    }
    async clearQueue() {
        await this.telegramQueue.clean(0, 0, 'active');
        await this.telegramQueue.clean(0, 0, 'wait');
        await this.telegramQueue.clean(0, 0, 'completed');
        await this.telegramQueue.clean(0, 0, 'failed');
    }
};
exports.TelegramQueueService = TelegramQueueService;
exports.TelegramQueueService = TelegramQueueService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_connection_service_1.RedisConnectionService])
], TelegramQueueService);
//# sourceMappingURL=telegram-queue.service.js.map