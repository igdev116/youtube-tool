import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { YoutubeChannelService } from '../youtube-channel/youtube-channel.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);
  private isProcessing = false; // Flag để tránh overlap

  constructor(private readonly youtubeChannelService: YoutubeChannelService) {}

  @Cron('*/30 * * * * *') // mỗi 30 giây
  async handleYoutubeChannelCron() {
    // console.log('--------------------------------');

    // Kiểm tra nếu đang xử lý thì bỏ qua
    if (this.isProcessing) {
      // this.logger.log('⏳ Cron đang chạy, bỏ qua lần này...');
      return;
    }

    try {
      this.isProcessing = true;
      // this.logger.log('🚀 Running YouTube channel notification cron...');
      await this.youtubeChannelService.notifyAllChannelsNewVideo();
      // this.logger.log('✅ Done YouTube channel notification cron');
    } catch (error) {
      // this.logger.error('❌ Error in YouTube channel cron:', error.message);
    } finally {
      this.isProcessing = false;
    }
  }
}
