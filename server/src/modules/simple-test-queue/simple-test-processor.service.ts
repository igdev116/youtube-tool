import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { SimpleTestJob, SimpleTestService } from './simple-test.service';

@Injectable()
export class SimpleTestProcessorService implements OnModuleInit {
  private readonly logger = new Logger(SimpleTestProcessorService.name);
  private worker: Worker;

  constructor(private readonly simpleTestService: SimpleTestService) {}

  onModuleInit() {
    this.worker = new Worker(
      'simple-test-queue',
      async (job: Job<SimpleTestJob>) => {
        console.log(`🍕 Đang xử lý Order: ${job.id}`);

        try {
          // Mô phỏng thời gian xử lý
          await new Promise((resolve) => setTimeout(resolve, 1000));

          console.log(`✅ Hoàn thành Order: ${job.id}`);
          // Job sẽ tự động được xóa bởi removeOnComplete: true

          // Kiểm tra và reset orderCounter nếu queue trống
          await this.simpleTestService.resetOrderCounter();
        } catch (error) {
          console.log(`❌ Lỗi Order: ${job.id} - ${error.message}`);
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
      this.logger.log(`Job ${job.id} completed`);
    });

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Job ${job?.id} failed: ${err.message}`);
    });
  }
}
