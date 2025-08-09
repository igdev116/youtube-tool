import { OnModuleInit } from '@nestjs/common';
import { Queue } from 'bull';
export interface TelegramMessageJob {
    groupId: string;
    video: {
        title: string;
        url: string;
        channelId?: string;
        thumbnail: string;
        jobId: string;
        publishedAt?: string;
    };
}
export declare class TelegramQueueService implements OnModuleInit {
    private readonly telegramQueue;
    constructor(telegramQueue: Queue);
    onModuleInit(): void;
    private jobCounter;
    private delay;
    addTelegramMessageJob(jobData: TelegramMessageJob): Promise<void>;
    resetJobCounter(): Promise<void>;
    getQueueStatus(): Promise<{
        waiting: number;
        active: number;
        completed: number;
        failed: number;
        total: number;
    }>;
    clearQueue(): Promise<void>;
}
