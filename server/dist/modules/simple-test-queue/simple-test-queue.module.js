"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleTestQueueModule = void 0;
const common_1 = require("@nestjs/common");
const simple_test_service_1 = require("./simple-test.service");
const simple_test_processor_service_1 = require("./simple-test-processor.service");
const simple_test_controller_1 = require("./simple-test.controller");
let SimpleTestQueueModule = class SimpleTestQueueModule {
};
exports.SimpleTestQueueModule = SimpleTestQueueModule;
exports.SimpleTestQueueModule = SimpleTestQueueModule = __decorate([
    (0, common_1.Module)({
        providers: [simple_test_service_1.SimpleTestService, simple_test_processor_service_1.SimpleTestProcessorService],
        exports: [simple_test_service_1.SimpleTestService],
        controllers: [simple_test_controller_1.SimpleTestController],
    })
], SimpleTestQueueModule);
//# sourceMappingURL=simple-test-queue.module.js.map