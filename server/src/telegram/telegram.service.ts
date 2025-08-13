import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Injectable()
export class TelegramService {
  constructor(private readonly userService: UserService) {}

  async updateTelegramGroupId(userId: string, groupId: string) {
    return this.userService.updateTelegramGroupId(userId, groupId);
  }

  async updateBotToken(userId: string, botToken: string) {
    return this.userService.updateBotToken(userId, botToken);
  }
}
