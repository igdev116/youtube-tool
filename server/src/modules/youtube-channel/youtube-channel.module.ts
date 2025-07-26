import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { YoutubeChannel, YoutubeChannelSchema } from './youtube-channel.schema';
import { YoutubeChannelService } from './youtube-channel.service';
import { YoutubeChannelController } from './youtube-channel.controller';
import { UserModule } from '../../user/user.module';
import { TelegramModule } from '../../telegram/telegram.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: YoutubeChannel.name, schema: YoutubeChannelSchema },
    ]),
    UserModule,
    TelegramModule,
  ],
  providers: [YoutubeChannelService],
  exports: [YoutubeChannelService],
  controllers: [YoutubeChannelController],
})
export class YoutubeChannelModule {}
