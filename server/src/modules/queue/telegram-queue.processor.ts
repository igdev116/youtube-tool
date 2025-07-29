import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { TelegramBotService } from '../../telegram/telegram-bot.service';
import {
  TelegramMessageJob,
  TelegramQueueService,
} from './telegram-queue.service';
import { RedisConnectionService } from './redis-connection.service';

@Injectable()
export class TelegramQueueProcessor implements OnModuleInit {
  private readonly logger = new Logger(TelegramQueueProcessor.name);
  private worker: Worker;

  constructor(
    private readonly telegramBotService: TelegramBotService,
    private readonly telegramQueueService: TelegramQueueService,
    private readonly redisConnectionService: RedisConnectionService,
  ) {}

  onModuleInit() {
    this.worker = new Worker(
      'telegram-queue',
      async (job: Job<TelegramMessageJob>) => {
        try {
          // Gửi tin nhắn Telegram thật
          await this.telegramBotService.sendNewVideoToGroup(
            job.data.groupId,
            job.data.video,
          );

          // Kiểm tra và reset jobCounter nếu queue trống
          await this.telegramQueueService.resetJobCounter();
        } catch (error) {
          console.error(`❌ Lỗi gửi tin nhắn: ${job.id} - ${error.message}`);
          throw error; // Re-throw để Bull retry
        }
      },
      {
        connection: this.redisConnectionService.getConnectionConfig(),
        concurrency: 1, // Chỉ xử lý 1 job tại một thời điểm
      },
    );

    console.log('📱 Telegram queue processor đã được khởi tạo');
  }
}
