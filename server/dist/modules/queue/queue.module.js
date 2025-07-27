"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueModule = void 0;
const common_1 = require("@nestjs/common");
const telegram_queue_processor_1 = require("./telegram-queue.processor");
const telegram_module_1 = require("../../telegram/telegram.module");
const telegram_queue_service_1 = require("./telegram-queue.service");
const telegram_queue_controller_1 = require("./telegram-queue.controller");
const redis_connection_service_1 = require("./redis-connection.service");
let QueueModule = class QueueModule {
};
exports.QueueModule = QueueModule;
exports.QueueModule = QueueModule = __decorate([
    (0, common_1.Module)({
        imports: [telegram_module_1.TelegramModule],
        providers: [
            telegram_queue_service_1.TelegramQueueService,
            telegram_queue_processor_1.TelegramQueueProcessor,
            redis_connection_service_1.RedisConnectionService,
        ],
        exports: [telegram_queue_service_1.TelegramQueueService, redis_connection_service_1.RedisConnectionService],
        controllers: [telegram_queue_controller_1.TelegramQueueController],
    })
], QueueModule);
//# sourceMappingURL=queue.module.js.map