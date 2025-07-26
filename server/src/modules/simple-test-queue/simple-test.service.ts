import { Injectable, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';

export interface SimpleTestJob {
  orderId: string;
  title: string;
}

@Injectable()
export class SimpleTestService implements OnModuleInit {
  private testQueue: Queue;
  private orderCounter = 0;

  async onModuleInit() {
    this.testQueue = new Queue('simple-test-queue', {
      connection: {
        host: 'localhost',
        port: 6379,
      },
      defaultJobOptions: {
        removeOnComplete: true, // Tự động xóa job khi hoàn thành
        removeOnFail: 3, // Giữ lại 3 job failed gần nhất
      },
    });

    // Clear queue khi start server để tránh jobs cũ gửi liên tục
    await this.clearQueue();
    console.log('🧹 Đã clear simple-test queue khi start server');
  }

  async addOrder(title: string) {
    const orderId = `ORDER-${this.orderCounter}`;

    const jobData: SimpleTestJob = {
      orderId,
      title,
    };

    console.log(`jobCounter: ${this.orderCounter}`);

    await this.testQueue.add('process-order', jobData, {
      delay: this.orderCounter * 5000, // Delay tăng dần: 2s, 4s, 6s...
      attempts: 3, // Retry tối đa 3 lần nếu fail
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });

    this.orderCounter++;
  }

  // Reset orderCounter khi queue trống
  async resetOrderCounter() {
    const waiting = await this.testQueue.getWaiting();
    const active = await this.testQueue.getActive();

    // Nếu không còn job nào đang chờ hoặc đang xử lý, reset counter
    if (waiting.length === 0 && active.length === 0) {
      this.orderCounter = 0;
      console.log('🔄 Reset orderCounter về 0 vì queue đã trống');
    }
  }

  async getQueueStatus() {
    const waiting = await this.testQueue.getWaiting();
    const active = await this.testQueue.getActive();
    const completed = await this.testQueue.getCompleted();
    const failed = await this.testQueue.getFailed();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      total: waiting.length + active.length + completed.length + failed.length,
    };
  }

  async clearQueue() {
    await this.testQueue.clean(0, 0, 'active');
    await this.testQueue.clean(0, 0, 'wait');
    await this.testQueue.clean(0, 0, 'completed');
    await this.testQueue.clean(0, 0, 'failed');
  }

  getQueue() {
    return this.testQueue;
  }
}
