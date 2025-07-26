import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { extractGroupIdFromUrl } from './telegram.utils';

interface JwtUser {
  sub: string;
  username: string;
}

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @UseGuards(JwtAuthGuard)
  @Post('update-group')
  async updateGroup(@Body() body: { link: string }, @Req() req: Request) {
    const user = req.user as JwtUser;
    const userId = user.sub;
    const groupId = extractGroupIdFromUrl(body.link);
    if (!groupId) {
      return {
        success: false,
        statusCode: 400,
        message: 'Link không hợp lệ hoặc không tìm thấy groupId',
        result: null,
      };
    }
    const updated = await this.telegramService.updateTelegramGroupId(
      userId,
      groupId,
    );
    return {
      success: true,
      statusCode: 200,
      message: 'Cập nhật groupId thành công',
      result: updated,
    };
  }
}
