import { Module } from '@nestjs/common';
import { TelegramQueueProcessor } from './telegram-queue.processor';
import { TelegramModule } from '../../telegram/telegram.module';
import { TelegramQueueService } from './telegram-queue.service';
import { TelegramQueueController } from './telegram-queue.controller';

@Module({
  imports: [TelegramModule],
  providers: [TelegramQueueService, TelegramQueueProcessor],
  exports: [TelegramQueueService],
  controllers: [TelegramQueueController],
})
export class QueueModule {}
