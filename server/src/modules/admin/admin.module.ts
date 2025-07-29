import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  YoutubeChannel,
  YoutubeChannelSchema,
} from '../youtube-channel/youtube-channel.schema';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: YoutubeChannel.name, schema: YoutubeChannelSchema },
    ]),
  ],
  providers: [AdminService],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}
