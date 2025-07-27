import { OnModuleInit } from '@nestjs/common';
export interface TelegramMessageJob {
    groupId: string;
    video: {
        title: string;
        url: string;
        channelId?: string;
        thumbnail: string;
    };
}
export declare class TelegramQueueService implements OnModuleInit {
    private telegramQueue;
    onModuleInit(): Promise<void>;
    private jobCounter;
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
