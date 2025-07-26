import { Controller, Post, Get } from '@nestjs/common';
import { SimpleTestService } from './simple-test.service';

@Controller('simple-test')
export class SimpleTestController {
  constructor(private readonly simpleTestService: SimpleTestService) {}

  @Post('add-orders')
  async addOrders() {
    console.log('🍕 Bắt đầu thêm orders vào queue...');

    // Thêm 5 orders với delay tăng dần
    for (let i = 1; i <= 5; i++) {
      await this.simpleTestService.addOrder(`Order ${i}`);
      console.log(`✅ Đã thêm Order ${i} vào queue`);
    }

    console.log('🎉 Hoàn thành! Tất cả orders đã được thêm vào queue');

    return {
      success: true,
      message: 'Đã thêm 5 orders vào queue',
      orders: [1, 2, 3, 4, 5],
    };
  }

  @Get('status')
  async getStatus() {
    const status = await this.simpleTestService.getQueueStatus();
    console.log('📊 Trạng thái queue:', status);

    return {
      success: true,
      status,
    };
  }

  @Post('clear')
  async clearQueue() {
    await this.simpleTestService.clearQueue();
    console.log('🗑️ Đã xóa tất cả orders');

    return {
      success: true,
      message: 'Đã xóa tất cả orders',
    };
  }

  @Post('reset-counter')
  async resetCounter() {
    await this.simpleTestService.resetOrderCounter();
    return {
      success: true,
      message: 'Đã reset orderCounter',
    };
  }
}
