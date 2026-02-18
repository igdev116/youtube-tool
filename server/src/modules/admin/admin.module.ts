import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  YoutubeChannel,
  YoutubeChannelSchema,
} from '../youtube-channel/youtube-channel.schema';
import { User, UserSchema } from '../../user/user.schema';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: YoutubeChannel.name, schema: YoutubeChannelSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [AdminService],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}
