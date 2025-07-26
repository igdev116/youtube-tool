import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

interface JwtUser {
  sub: string;
  username: string;
}

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: Request) {
    const user = req.user as JwtUser;
    const userId = user.sub;
    const profile = await this.userService.getProfile(userId);
    return {
      success: true,
      statusCode: 200,
      message: 'Lấy thông tin người dùng thành công',
      result: profile,
    };
  }
}
