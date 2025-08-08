import { Injectable, Logger } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { TelegramBotService } from '../../telegram/telegram-bot.service';
import {
  TelegramMessageJob,
  TelegramQueueService,
} from './telegram-queue.service';

@Injectable()
@Processor('telegram-queue')
export class TelegramQueueProcessor1 {
  private readonly logger = new Logger(TelegramQueueProcessor1.name);

  constructor(
    private readonly telegramBotService: TelegramBotService,
    private readonly telegramQueueService: TelegramQueueService,
  ) {}

  @Process('send-message-1')
  async handleSendMessage(job: Job<TelegramMessageJob>) {
    try {
      await this.telegramBotService.sendNewVideoToGroup(
        job.data.groupId,
        job.data.video,
      );
      await this.telegramQueueService.resetJobCounter();
    } catch (error) {
      console.error(`❌ Lỗi gửi tin nhắn: ${job.id} - ${error.message}`);
      throw error;
    }
  }
}

@Injectable()
@Processor('telegram-queue')
export class TelegramQueueProcessor2 {
  private readonly logger = new Logger(TelegramQueueProcessor2.name);

  constructor(
    private readonly telegramBotService: TelegramBotService,
    private readonly telegramQueueService: TelegramQueueService,
  ) {}

  @Process('send-message-2')
  async handleSendMessage(job: Job<TelegramMessageJob>) {
    try {
      await this.telegramBotService.sendNewVideoToGroup(
        job.data.groupId,
        job.data.video,
      );
      await this.telegramQueueService.resetJobCounter();
    } catch (error) {
      console.error(`❌ Lỗi gửi tin nhắn: ${job.id} - ${error.message}`);
      throw error;
    }
  }
}

@Injectable()
@Processor('telegram-queue')
export class TelegramQueueProcessor3 {
  private readonly logger = new Logger(TelegramQueueProcessor3.name);

  constructor(
    private readonly telegramBotService: TelegramBotService,
    private readonly telegramQueueService: TelegramQueueService,
  ) {}

  @Process('send-message-3')
  async handleSendMessage(job: Job<TelegramMessageJob>) {
    try {
      await this.telegramBotService.sendNewVideoToGroup(
        job.data.groupId,
        job.data.video,
      );
      await this.telegramQueueService.resetJobCounter();
    } catch (error) {
      console.error(`❌ Lỗi gửi tin nhắn: ${job.id} - ${error.message}`);
      throw error;
    }
  }
}

@Injectable()
@Processor('telegram-queue')
export class TelegramQueueProcessor4 {
  private readonly logger = new Logger(TelegramQueueProcessor4.name);

  constructor(
    private readonly telegramBotService: TelegramBotService,
    private readonly telegramQueueService: TelegramQueueService,
  ) {}

  @Process('send-message-4')
  async handleSendMessage(job: Job<TelegramMessageJob>) {
    try {
      await this.telegramBotService.sendNewVideoToGroup(
        job.data.groupId,
        job.data.video,
      );
      await this.telegramQueueService.resetJobCounter();
    } catch (error) {
      console.error(`❌ Lỗi gửi tin nhắn: ${job.id} - ${error.message}`);
      throw error;
    }
  }
}

@Injectable()
@Processor('telegram-queue')
export class TelegramQueueProcessor5 {
  private readonly logger = new Logger(TelegramQueueProcessor5.name);

  constructor(
    private readonly telegramBotService: TelegramBotService,
    private readonly telegramQueueService: TelegramQueueService,
  ) {}

  @Process('send-message-5')
  async handleSendMessage(job: Job<TelegramMessageJob>) {
    try {
      await this.telegramBotService.sendNewVideoToGroup(
        job.data.groupId,
        job.data.video,
      );
      await this.telegramQueueService.resetJobCounter();
    } catch (error) {
      console.error(`❌ Lỗi gửi tin nhắn: ${job.id} - ${error.message}`);
      throw error;
    }
  }
}
