import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import {
  TelegramQueueProcessor1,
  TelegramQueueProcessor2,
  TelegramQueueProcessor3,
  TelegramQueueProcessor4,
  TelegramQueueProcessor5,
} from './telegram-queue.processor';
import { TelegramModule } from '../../telegram/telegram.module';
import { TelegramQueueService } from './telegram-queue.service';
import { TelegramQueueController } from './telegram-queue.controller';

@Module({
  imports: [
    BullModule.forRoot({
      redis:
        process.env.NODE_ENV === 'production'
          ? {
              host: process.env.REDIS_HOST,
              port: Number(process.env.REDIS_PORT),
              password: process.env.REDIS_PASSWORD,
              username: process.env.REDIS_USERNAME,
              tls: {
                rejectUnauthorized: false,
              },
            }
          : {
              host: 'localhost',
              port: 6379,
            },
    }),
    BullModule.registerQueue({
      name: 'telegram-queue',
    }),
    TelegramModule,
  ],
  providers: [
    TelegramQueueService,
    // 5 processor classes riêng biệt để đạt concurrency là 5
    // Mỗi processor có handler name khác nhau để tránh conflict
    TelegramQueueProcessor1,
    TelegramQueueProcessor2,
    TelegramQueueProcessor3,
    TelegramQueueProcessor4,
    TelegramQueueProcessor5,
  ],
  exports: [TelegramQueueService],
  controllers: [TelegramQueueController],
})
export class QueueModule {}
