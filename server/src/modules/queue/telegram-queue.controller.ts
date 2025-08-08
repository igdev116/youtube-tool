import { Controller, Get, Post } from '@nestjs/common';
import { TelegramQueueService } from './telegram-queue.service';

@Controller('telegram-queue')
export class TelegramQueueController {
  constructor(private readonly telegramQueueService: TelegramQueueService) {}

  @Get('status')
  async getStatus() {
    const status = await this.telegramQueueService.getQueueStatus();
    return {
      success: true,
      status,
    };
  }

  @Post('clear')
  async clearQueue() {
    await this.telegramQueueService.clearQueue();
    return {
      success: true,
      message: 'Đã xóa tất cả jobs trong telegram queue',
    };
  }

  @Post('reset-counter')
  async resetCounter() {
    await this.telegramQueueService.resetJobCounter();
    return {
      success: true,
      message: 'Đã reset jobCounter',
    };
  }
}
