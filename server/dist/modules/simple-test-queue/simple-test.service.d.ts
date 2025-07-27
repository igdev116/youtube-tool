import { OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
export interface SimpleTestJob {
    orderId: string;
    title: string;
}
export declare class SimpleTestService implements OnModuleInit {
    private testQueue;
    private orderCounter;
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
