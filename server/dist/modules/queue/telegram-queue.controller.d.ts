import { TelegramQueueService } from './telegram-queue.service';
export declare class TelegramQueueController {
    private readonly telegramQueueService;
    constructor(telegramQueueService: TelegramQueueService);
    getStatus(): Promise<{
        success: boolean;
        status: {
            waiting: number;
            active: number;
            completed: number;
            failed: number;
            total: number;
        };
    }>;
    clearQueue(): Promise<{
        success: boolean;
        message: string;
    }>;
    addTestJob(): Promise<{
        success: boolean;
        message: string;
    }>;
    resetCounter(): Promise<{
        success: boolean;
        message: string;
    }>;
}
