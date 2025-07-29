import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { YoutubeChannelModule } from './modules/youtube-channel/youtube-channel.module';
import { TelegramModule } from './telegram/telegram.module';
import { CronModule } from './modules/cron/cron.module';
import { QueueModule } from './modules/queue/queue.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.NODE_ENV === 'production'
        ? (process.env.MONGO_URI ?? '')
        : (process.env.MONGO_URI_LOCAL ?? ''),
    ),
    UserModule,
    AuthModule,
    YoutubeChannelModule,
    TelegramModule,
    CronModule,
    QueueModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
