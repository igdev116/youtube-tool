import { Module } from '@nestjs/common';

import { TelegramController } from './telegram.controller';
import { TelegramService } from './telegram.service';
import { UserModule } from '../user/user.module';
import { TelegramBotService } from './telegram-bot.service';

@Module({
  imports: [UserModule],
  providers: [TelegramService, TelegramBotService],
  exports: [TelegramService, TelegramBotService],
  controllers: [TelegramController],
})
export class TelegramModule {}
