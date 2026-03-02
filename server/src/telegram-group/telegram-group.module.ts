import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TelegramGroup, TelegramGroupSchema } from './telegram-group.schema';
import { TelegramGroupService } from './telegram-group.service';
import { TelegramGroupController } from './telegram-group.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TelegramGroup.name, schema: TelegramGroupSchema },
    ]),
  ],
  controllers: [TelegramGroupController],
  providers: [TelegramGroupService],
  exports: [TelegramGroupService],
})
export class TelegramGroupModule {}
