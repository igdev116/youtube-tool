import { Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { YoutubeWebsubService } from './youtube-websub.service';
import { YT_FEED_BASE } from '../../constants';

@Controller('websub/youtube')
export class YoutubeWebsubController {
  private readonly logger = new Logger(YoutubeWebsubController.name);
  constructor(private readonly service: YoutubeWebsubService) {}

  // Verification (hub.challenge)
  @Get('callback')
  verify(@Query('hub.challenge') challenge?: string) {
    return challenge || '';
  }

  // Notification
  @Post('callback')
  async notify(@Body() xml: string) {
    await this.service.handleNotification(xml);
    return 'ok';
  }

  // Subscribe endpoint for testing
  @Post('subscribe')
  async subscribe(
    @Body() body: { xmlChannelId: string; callbackUrl?: string },
  ) {
    const topicUrl = `${YT_FEED_BASE}?channel_id=${body.xmlChannelId}`;
    const callbackUrl =
      body.callbackUrl || `${process.env.API_URL}/websub/youtube/callback`;
    const status = await this.service.subscribeCallback(topicUrl, callbackUrl);
    return { success: status >= 200 && status < 300, status };
  }

  // Unsubscribe endpoint for testing
  @Post('unsubscribe')
  async unsubscribe(
    @Body() body: { xmlChannelId: string; callbackUrl?: string },
  ) {
    const topicUrl = `${YT_FEED_BASE}?channel_id=${body.xmlChannelId}`;
    const callbackUrl =
      body.callbackUrl || `${process.env.API_URL}/websub/youtube/callback`;
    const status = await this.service.unsubscribeCallback(
      topicUrl,
      callbackUrl,
    );
    return { success: status >= 200 && status < 300, status };
  }

  @Post('renew')
  async renew() {
    await this.service.renewExpiringSubscriptions();
    return { message: 'Renew process started' };
  }
}
