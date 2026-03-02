import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { YoutubeChannel, YoutubeChannelSchema } from './youtube-channel.schema';
import { YoutubeChannelService } from './youtube-channel.service';
import { YoutubeChannelController } from './youtube-channel.controller';
import { UserModule } from '../../user/user.module';
import { TelegramModule } from '../../telegram/telegram.module';
import { YoutubeWebsubModule } from '../websub/youtube-websub.module';
import {
  TelegramGroup,
  TelegramGroupSchema,
} from '../../telegram-group/telegram-group.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: YoutubeChannel.name, schema: YoutubeChannelSchema },
      // Đăng ký schema TelegramGroup để Mongoose có thể populate 'groups' field
      { name: TelegramGroup.name, schema: TelegramGroupSchema },
    ]),
    UserModule,
    TelegramModule,
    YoutubeWebsubModule,
  ],
  providers: [YoutubeChannelService],
  exports: [YoutubeChannelService],
  controllers: [YoutubeChannelController],
})
export class YoutubeChannelModule {}
