import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { YoutubeChannelService } from '../youtube-channel/youtube-channel.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);
  constructor(private readonly youtubeChannelService: YoutubeChannelService) {}

  @Cron('*/50 * * * * *') // mỗi phút
  async handleYoutubeChannelCron() {
    // this.logger.log('🚀 Running YouTube channel notification cron...');
    await this.youtubeChannelService.notifyAllChannelsNewVideo();
    // this.logger.log('✅ Done YouTube channel notification cron');
  }
}
