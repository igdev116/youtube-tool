import { Job } from 'bull';
import { TelegramBotService } from '../../telegram/telegram-bot.service';
import { TelegramMessageJob, TelegramQueueService } from './telegram-queue.service';
export declare class TelegramQueueProcessor1 {
    private readonly telegramBotService;
    private readonly telegramQueueService;
    private readonly logger;
    constructor(telegramBotService: TelegramBotService, telegramQueueService: TelegramQueueService);
    handleSendMessage(job: Job<TelegramMessageJob>): Promise<void>;
}
export declare class TelegramQueueProcessor2 {
    private readonly telegramBotService;
    private readonly telegramQueueService;
    private readonly logger;
    constructor(telegramBotService: TelegramBotService, telegramQueueService: TelegramQueueService);
    handleSendMessage(job: Job<TelegramMessageJob>): Promise<void>;
}
export declare class TelegramQueueProcessor3 {
    private readonly telegramBotService;
    private readonly telegramQueueService;
    private readonly logger;
    constructor(telegramBotService: TelegramBotService, telegramQueueService: TelegramQueueService);
    handleSendMessage(job: Job<TelegramMessageJob>): Promise<void>;
}
export declare class TelegramQueueProcessor4 {
    private readonly telegramBotService;
    private readonly telegramQueueService;
    private readonly logger;
    constructor(telegramBotService: TelegramBotService, telegramQueueService: TelegramQueueService);
    handleSendMessage(job: Job<TelegramMessageJob>): Promise<void>;
}
export declare class TelegramQueueProcessor5 {
    private readonly telegramBotService;
    private readonly telegramQueueService;
    private readonly logger;
    constructor(telegramBotService: TelegramBotService, telegramQueueService: TelegramQueueService);
    handleSendMessage(job: Job<TelegramMessageJob>): Promise<void>;
}
