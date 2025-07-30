"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisConnectionService = void 0;
const common_1 = require("@nestjs/common");
let RedisConnectionService = class RedisConnectionService {
    getConnectionConfig() {
        return process.env.NODE_ENV === 'production'
            ? {
                host: process.env.REDIS_HOST,
                port: Number(process.env.REDIS_PORT),
                password: process.env.REDIS_PASSWORD,
                username: process.env.REDIS_USERNAME,
                tls: {
                    rejectUnauthorized: false,
                },
                maxmemoryPolicy: 'allkeys-lru',
                ttl: 3600,
            }
            : {
                host: 'localhost',
                port: 6379,
                maxmemoryPolicy: 'allkeys-lru',
                ttl: 3600,
            };
    }
};
exports.RedisConnectionService = RedisConnectionService;
exports.RedisConnectionService = RedisConnectionService = __decorate([
    (0, common_1.Injectable)()
], RedisConnectionService);
//# sourceMappingURL=redis-connection.service.js.map