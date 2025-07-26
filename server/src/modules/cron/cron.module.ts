import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from './cron.service';
import { YoutubeChannelModule } from '../youtube-channel/youtube-channel.module';
import { UserModule } from '../../user/user.module';
import { TelegramModule } from '../../telegram/telegram.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    YoutubeChannelModule,
    UserModule,
    TelegramModule,
  ],
  providers: [CronService],
  exports: [CronService],
})
export class CronModule {}
