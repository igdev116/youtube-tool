import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

export interface TelegramMessageJob {
  groupId: string;
  video: {
    title: string;
    url: string;
    channelId?: string;
    thumbnail: string;
    jobId: string;
    publishedAt: string; // ISO string
  };
}

@Injectable()
export class TelegramQueueService implements OnModuleInit {
  constructor(
    @InjectQueue('telegram-queue') private readonly telegramQueue: Queue,
  ) {}

  onModuleInit() {
    console.log('📱 Telegram queue đã được khởi tạo');
  }

  private jobCounter = 0;
  private delay = 0;

  async addTelegramMessageJob(jobData: TelegramMessageJob) {
    // console.log(`📊 Adding job - Counter: ${this.jobCounter}`);

    // Chọn handler dựa trên jobCounter để phân tán tải
    const handlerNames = [
      'send-message-1',
      'send-message-2',
      'send-message-3',
      'send-message-4',
      'send-message-5',
    ];

    const selectedHandler = handlerNames[this.jobCounter % handlerNames.length];

    await this.telegramQueue.add(selectedHandler, jobData, {
      jobId: jobData.video.jobId,
      delay: this.jobCounter * this.delay, // Giảm từ 5000 xuống 2000ms
      attempts: 3, // Retry tối đa 3 lần nếu fail
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true, // Tự động xóa job khi hoàn thành
    });

    this.jobCounter++;
  }

  // Reset jobCounter khi queue trống
  async resetJobCounter() {
    const waiting = await this.telegramQueue.getWaiting();

    // Nếu không còn job nào đang chờ, reset counter
    if (waiting.length === 0) {
      this.jobCounter = 0;
    }
  }

  async getQueueStatus() {
    const waiting = await this.telegramQueue.getWaiting();
    const active = await this.telegramQueue.getActive();
    const completed = await this.telegramQueue.getCompleted();
    const failed = await this.telegramQueue.getFailed();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      total: waiting.length + active.length + completed.length + failed.length,
    };
  }

  async clearQueue() {
    try {
      // Xóa tất cả jobs trong queue
      await this.telegramQueue.clean(0, 'active');
      await this.telegramQueue.clean(0, 'wait');
      await this.telegramQueue.clean(0, 'completed');
      await this.telegramQueue.clean(0, 'failed');

      // Xóa toàn bộ queue và tất cả keys liên quan
      await this.telegramQueue.obliterate({ force: true });

      // Reset counter
      this.jobCounter = 0;

      console.log(
        '🧹 Đã xóa hoàn toàn telegram queue và tất cả keys trong Redis',
      );
    } catch (error: any) {
      console.error('❌ Lỗi khi clear queue:', error.message);
    }
  }
}
