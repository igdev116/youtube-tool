import { OnModuleInit } from '@nestjs/common';
import { SimpleTestService } from './simple-test.service';
import { RedisConnectionService } from '../queue/redis-connection.service';
export declare class SimpleTestProcessorService implements OnModuleInit {
    private readonly simpleTestService;
    private readonly redisConnectionService;
    private readonly logger;
    private worker;
    constructor(simpleTestService: SimpleTestService, redisConnectionService: RedisConnectionService);
    onModuleInit(): void;
}
