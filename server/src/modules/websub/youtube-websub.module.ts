import { Module } from '@nestjs/common';
import { YoutubeWebsubController } from './youtube-websub.controller';
import { YoutubeWebsubService } from './youtube-websub.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  YoutubeChannel,
  YoutubeChannelSchema,
} from '../youtube-channel/youtube-channel.schema';
import { TelegramModule } from '../../telegram/telegram.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: YoutubeChannel.name, schema: YoutubeChannelSchema },
    ]),
    TelegramModule,
  ],
  controllers: [YoutubeWebsubController],
  providers: [YoutubeWebsubService],
  exports: [YoutubeWebsubService],
})
export class YoutubeWebsubModule {}
