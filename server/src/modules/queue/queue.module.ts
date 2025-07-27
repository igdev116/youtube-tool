import { Module } from '@nestjs/common';
import { TelegramQueueProcessor } from './telegram-queue.processor';
import { TelegramModule } from '../../telegram/telegram.module';
import { TelegramQueueService } from './telegram-queue.service';
import { TelegramQueueController } from './telegram-queue.controller';
import { RedisConnectionService } from './redis-connection.service';

@Module({
  imports: [TelegramModule],
  providers: [
    TelegramQueueService,
    TelegramQueueProcessor,
    RedisConnectionService,
  ],
  exports: [TelegramQueueService, RedisConnectionService],
  controllers: [TelegramQueueController],
})
export class QueueModule {}
