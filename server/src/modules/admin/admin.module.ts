import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  YoutubeChannel,
  YoutubeChannelSchema,
} from '../youtube-channel/youtube-channel.schema';
import { User, UserSchema } from '../../user/user.schema';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UserModule } from '../../user/user.module';
import { AdminGuard } from '../../auth/admin.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: YoutubeChannel.name, schema: YoutubeChannelSchema },
      { name: User.name, schema: UserSchema },
    ]),
    UserModule,
  ],
  providers: [AdminService, AdminGuard],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}
