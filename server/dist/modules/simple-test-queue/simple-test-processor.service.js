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
var SimpleTestProcessorService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleTestProcessorService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("bullmq");
const simple_test_service_1 = require("./simple-test.service");
const redis_connection_service_1 = require("../queue/redis-connection.service");
let SimpleTestProcessorService = SimpleTestProcessorService_1 = class SimpleTestProcessorService {
    simpleTestService;
    redisConnectionService;
    logger = new common_1.Logger(SimpleTestProcessorService_1.name);
    worker;
    constructor(simpleTestService, redisConnectionService) {
        this.simpleTestService = simpleTestService;
        this.redisConnectionService = redisConnectionService;
    }
    onModuleInit() {
        this.worker = new bullmq_1.Worker('simple-test-queue', async (job) => {
            console.log(`🍕 Đang xử lý Order: ${job.id}`);
            try {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                console.log(`✅ Hoàn thành Order: ${job.id}`);
                await this.simpleTestService.resetOrderCounter();
            }
            catch (error) {
                console.log(`❌ Lỗi Order: ${job.id} - ${error.message}`);
                throw error;
            }
        }, {
            connection: this.redisConnectionService.getConnectionConfig(),
            concurrency: 1,
        });
        this.worker.on('completed', (job) => {
            this.logger.log(`Job ${job.id} completed`);
        });
        this.worker.on('failed', (job, err) => {
            this.logger.error(`Job ${job?.id} failed: ${err.message}`);
        });
    }
};
exports.SimpleTestProcessorService = SimpleTestProcessorService;
exports.SimpleTestProcessorService = SimpleTestProcessorService = SimpleTestProcessorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof simple_test_service_1.SimpleTestService !== "undefined" && simple_test_service_1.SimpleTestService) === "function" ? _a : Object, redis_connection_service_1.RedisConnectionService])
], SimpleTestProcessorService);
//# sourceMappingURL=simple-test-processor.service.js.map