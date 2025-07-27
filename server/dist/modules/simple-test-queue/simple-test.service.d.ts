import { OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import { RedisConnectionService } from '../queue/redis-connection.service';
export interface SimpleTestJob {
    orderId: string;
    title: string;
}
export declare class SimpleTestService implements OnModuleInit {
    private readonly redisConnectionService;
    private testQueue;
    private orderCounter;
    constructor(redisConnectionService: RedisConnectionService);
    onModuleInit(): Promise<void>;
    addOrder(title: string): Promise<void>;
    resetOrderCounter(): Promise<void>;
    getQueueStatus(): Promise<{
        waiting: number;
        active: number;
        completed: number;
        failed: number;
        total: number;
    }>;
    clearQueue(): Promise<void>;
    getQueue(): Queue<any, any, string, any, any, string>;
}
