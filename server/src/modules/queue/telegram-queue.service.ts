import { Injectable, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import { RedisConnectionService } from './redis-connection.service';

export interface TelegramMessageJob {
  groupId: string;
  video: {
    title: string;
    url: string;
    channelId?: string;
    thumbnail: string;
  };
}

@Injectable()
export class TelegramQueueService implements OnModuleInit {
  private telegramQueue: Queue;

  constructor(
    private readonly redisConnectionService: RedisConnectionService,
  ) {}

  async onModuleInit() {
    this.telegramQueue = new Queue('telegram-queue', {
      connection: this.redisConnectionService.getConnectionConfig(),
      defaultJobOptions: {
        removeOnComplete: true, // Tự động xóa job khi hoàn thành
        removeOnFail: 3, // Giữ lại 3 job failed gần nhất
      },
    });

    // Clear queue khi start server để tránh jobs cũ gửi liên tục
    await this.clearQueue();
    console.log('🧹 Đã clear telegram queue khi start server');
  }

  private jobCounter = 0;

  async addTelegramMessageJob(jobData: TelegramMessageJob) {
    console.log(`📊 Adding job - Counter: ${this.jobCounter}`);

    await this.telegramQueue.add('send-message', jobData, {
      delay: this.jobCounter * 5000, // Delay tăng dần: 0s, 5s, 10s...
      attempts: 3, // Retry tối đa 3 lần nếu fail
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });

    this.jobCounter++;
  }

  // Reset jobCounter khi queue trống
  async resetJobCounter() {
    const waiting = await this.telegramQueue.getWaiting();
    const active = await this.telegramQueue.getActive();

    // Nếu không còn job nào đang chờ hoặc đang xử lý, reset counter
    if (waiting.length === 0 && active.length === 0) {
      this.jobCounter = 0;
      console.log('🔄 Reset jobCounter về 0 vì queue đã trống');
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
      await this.telegramQueue.clean(0, 0, 'active');
      await this.telegramQueue.clean(0, 0, 'wait');
      await this.telegramQueue.clean(0, 0, 'completed');
      await this.telegramQueue.clean(0, 0, 'failed');

      // Xóa toàn bộ queue và tất cả keys liên quan
      await this.telegramQueue.obliterate({ force: true });

      // Reset counter
      this.jobCounter = 0;

      console.log(
        '🧹 Đã xóa hoàn toàn telegram queue và tất cả keys trong Redis',
      );
    } catch (error) {
      console.error('❌ Lỗi khi clear queue:', error.message);
    }
  }
}
