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
exports.TelegramQueueService = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
let TelegramQueueService = class TelegramQueueService {
    telegramQueue;
    constructor(telegramQueue) {
        this.telegramQueue = telegramQueue;
    }
    onModuleInit() {
        console.log('📱 Telegram queue đã được khởi tạo');
    }
    jobCounter = 0;
    delay = 0;
    async addTelegramMessageJob(jobData) {
        const handlerNames = [
            'send-message-1',
            'send-message-2',
            'send-message-3',
            'send-message-4',
            'send-message-5',
        ];
        const selectedHandler = handlerNames[this.jobCounter % handlerNames.length];
        await this.telegramQueue.add(selectedHandler, jobData, {
            jobId: jobData.video.jobId,
            delay: this.jobCounter * this.delay,
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 2000,
            },
            removeOnComplete: false,
            removeOnFail: 3,
        });
        this.jobCounter++;
    }
    async resetJobCounter() {
        const waiting = await this.telegramQueue.getWaiting();
        if (waiting.length === 0) {
            this.jobCounter = 0;
            console.log('🔄 Reset jobCounter về 0 vì không còn job waiting');
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
        try {
            await this.telegramQueue.clean(0, 'active');
            await this.telegramQueue.clean(0, 'wait');
            await this.telegramQueue.clean(0, 'completed');
            await this.telegramQueue.clean(0, 'failed');
            await this.telegramQueue.obliterate({ force: true });
            this.jobCounter = 0;
            console.log('🧹 Đã xóa hoàn toàn telegram queue và tất cả keys trong Redis');
        }
        catch (error) {
            console.error('❌ Lỗi khi clear queue:', error.message);
        }
    }
};
exports.TelegramQueueService = TelegramQueueService;
exports.TelegramQueueService = TelegramQueueService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bull_1.InjectQueue)('telegram-queue')),
    __metadata("design:paramtypes", [Object])
], TelegramQueueService);
//# sourceMappingURL=telegram-queue.service.js.map