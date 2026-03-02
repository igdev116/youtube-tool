import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TelegramGroup, TelegramGroupSchema } from './telegram-group.schema';
import { TelegramGroupService } from './telegram-group.service';
import { TelegramGroupController } from './telegram-group.controller';
import {
  YoutubeChannel,
  YoutubeChannelSchema,
} from '../modules/youtube-channel/youtube-channel.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TelegramGroup.name, schema: TelegramGroupSchema },
      { name: YoutubeChannel.name, schema: YoutubeChannelSchema },
    ]),
  ],
  controllers: [TelegramGroupController],
  providers: [TelegramGroupService],
  exports: [TelegramGroupService],
})
export class TelegramGroupModule {}
