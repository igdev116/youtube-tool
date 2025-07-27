"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleTestService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("bullmq");
let SimpleTestService = class SimpleTestService {
    testQueue;
    orderCounter = 0;
    async onModuleInit() {
        this.testQueue = new bullmq_1.Queue('simple-test-queue', {
            connection: {
                host: 'localhost',
                port: 6379,
            },
            defaultJobOptions: {
                removeOnComplete: true,
                removeOnFail: 3,
            },
        });
        await this.clearQueue();
        console.log('🧹 Đã clear simple-test queue khi start server');
    }
    async addOrder(title) {
        const orderId = `ORDER-${this.orderCounter}`;
        const jobData = {
            orderId,
            title,
        };
        console.log(`jobCounter: ${this.orderCounter}`);
        await this.testQueue.add('process-order', jobData, {
            delay: this.orderCounter * 5000,
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 2000,
            },
        });
        this.orderCounter++;
    }
    async resetOrderCounter() {
        const waiting = await this.testQueue.getWaiting();
        const active = await this.testQueue.getActive();
        if (waiting.length === 0 && active.length === 0) {
            this.orderCounter = 0;
            console.log('🔄 Reset orderCounter về 0 vì queue đã trống');
        }
    }
    async getQueueStatus() {
        const waiting = await this.testQueue.getWaiting();
        const active = await this.testQueue.getActive();
        const completed = await this.testQueue.getCompleted();
        const failed = await this.testQueue.getFailed();
        return {
            waiting: waiting.length,
            active: active.length,
            completed: completed.length,
            failed: failed.length,
            total: waiting.length + active.length + completed.length + failed.length,
        };
    }
    async clearQueue() {
        await this.testQueue.clean(0, 0, 'active');
        await this.testQueue.clean(0, 0, 'wait');
        await this.testQueue.clean(0, 0, 'completed');
        await this.testQueue.clean(0, 0, 'failed');
    }
    getQueue() {
        return this.testQueue;
    }
};
exports.SimpleTestService = SimpleTestService;
exports.SimpleTestService = SimpleTestService = __decorate([
    (0, common_1.Injectable)()
], SimpleTestService);
//# sourceMappingURL=simple-test.service.js.map