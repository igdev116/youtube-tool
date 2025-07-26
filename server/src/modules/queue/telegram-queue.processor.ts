import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { TelegramBotService } from '../../telegram/telegram-bot.service';
import {
  TelegramMessageJob,
  TelegramQueueService,
} from './telegram-queue.service';

@Injectable()
export class TelegramQueueProcessor implements OnModuleInit {
  private readonly logger = new Logger(TelegramQueueProcessor.name);
  private worker: Worker;

  constructor(
    private readonly telegramBotService: TelegramBotService,
    private readonly telegramQueueService: TelegramQueueService,
  ) {}

  onModuleInit() {
    this.worker = new Worker(
      'telegram-queue',
      async (job: Job<TelegramMessageJob>) => {
        console.log(`📱 Đang gửi tin nhắn Telegram: ${job.id}`);

        try {
          // Gửi tin nhắn Telegram thật
          await this.telegramBotService.sendNewVideoToGroup(
            job.data.groupId,
            job.data.video,
          );

          console.log(`✅ Đã gửi tin nhắn thành công: ${job.id}`);
          // Job sẽ tự động được xóa bởi removeOnComplete: true

          // Kiểm tra và reset jobCounter nếu queue trống
          await this.telegramQueueService.resetJobCounter();
        } catch (error) {
          console.error(`❌ Lỗi gửi tin nhắn: ${job.id} - ${error.message}`);
          throw error; // Re-throw để Bull retry
        }
      },
      {
        connection: {
          host: 'localhost',
          port: 6379,
        },
        concurrency: 1, // Chỉ xử lý 1 job tại một thời điểm
      },
    );

    this.worker.on('completed', (job) => {
      console.log(`Job ${job.id} completed`);
      console.log('--------------------------------');
    });

    this.worker.on('failed', (job, err) => {
      console.error(`Job ${job?.id} failed: ${err.message}`);
    });
  }
}
