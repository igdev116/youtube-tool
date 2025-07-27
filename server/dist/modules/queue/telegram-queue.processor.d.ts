import { OnModuleInit } from '@nestjs/common';
import { TelegramBotService } from '../../telegram/telegram-bot.service';
import { TelegramQueueService } from './telegram-queue.service';
import { RedisConnectionService } from './redis-connection.service';
export declare class TelegramQueueProcessor implements OnModuleInit {
    private readonly telegramBotService;
    private readonly telegramQueueService;
    private readonly redisConnectionService;
    private readonly logger;
    private worker;
    constructor(telegramBotService: TelegramBotService, telegramQueueService: TelegramQueueService, redisConnectionService: RedisConnectionService);
    onModuleInit(): void;
}
