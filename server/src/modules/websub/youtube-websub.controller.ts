import { Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { YoutubeWebsubService } from './youtube-websub.service';

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
    const topicUrl = `https://www.youtube.com/xml/feeds/videos.xml?channel_id=${body.xmlChannelId}`;
    const callbackUrl =
      body.callbackUrl || `${process.env.APP_URL}/websub/youtube/callback`;
    const status = await this.service.subscribeCallback(topicUrl, callbackUrl);
    return { success: status >= 200 && status < 300, status };
  }
}
