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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleTestController = void 0;
const common_1 = require("@nestjs/common");
const simple_test_service_1 = require("./simple-test.service");
let SimpleTestController = class SimpleTestController {
    simpleTestService;
    constructor(simpleTestService) {
        this.simpleTestService = simpleTestService;
    }
    async addOrders() {
        console.log('🍕 Bắt đầu thêm orders vào queue...');
        for (let i = 1; i <= 5; i++) {
            await this.simpleTestService.addOrder(`Order ${i}`);
            console.log(`✅ Đã thêm Order ${i} vào queue`);
        }
        console.log('🎉 Hoàn thành! Tất cả orders đã được thêm vào queue');
        return {
            success: true,
            message: 'Đã thêm 5 orders vào queue',
            orders: [1, 2, 3, 4, 5],
        };
    }
    async getStatus() {
        const status = await this.simpleTestService.getQueueStatus();
        console.log('📊 Trạng thái queue:', status);
        return {
            success: true,
            status,
        };
    }
    async clearQueue() {
        await this.simpleTestService.clearQueue();
        console.log('🗑️ Đã xóa tất cả orders');
        return {
            success: true,
            message: 'Đã xóa tất cả orders',
        };
    }
    async resetCounter() {
        await this.simpleTestService.resetOrderCounter();
        return {
            success: true,
            message: 'Đã reset orderCounter',
        };
    }
};
exports.SimpleTestController = SimpleTestController;
__decorate([
    (0, common_1.Post)('add-orders'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SimpleTestController.prototype, "addOrders", null);
__decorate([
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SimpleTestController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Post)('clear'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SimpleTestController.prototype, "clearQueue", null);
__decorate([
    (0, common_1.Post)('reset-counter'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SimpleTestController.prototype, "resetCounter", null);
exports.SimpleTestController = SimpleTestController = __decorate([
    (0, common_1.Controller)('simple-test'),
    __metadata("design:paramtypes", [typeof (_a = typeof simple_test_service_1.SimpleTestService !== "undefined" && simple_test_service_1.SimpleTestService) === "function" ? _a : Object])
], SimpleTestController);
//# sourceMappingURL=simple-test.controller.js.map