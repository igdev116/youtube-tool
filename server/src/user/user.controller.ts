import {
  Controller,
  Get,
  Req,
  UseGuards,
  Post,
  Body,
  Delete,
  Query,
} from '@nestjs/common';
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

  @UseGuards(JwtAuthGuard)
  @Get('favorites')
  async getFavorites(@Req() req: Request) {
    const user = req.user as JwtUser;
    const userId = user.sub;
    const list = await this.userService.getFavoriteChannels(userId);
    return {
      success: true,
      statusCode: 200,
      message: 'Lấy danh sách kênh yêu thích thành công',
      result: list,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('favorites')
  async addFavorite(@Req() req: Request, @Body() body: { channelId: string }) {
    const user = req.user as JwtUser;
    const userId = user.sub;
    const updated = await this.userService.addFavoriteChannel(
      userId,
      body.channelId,
    );
    return {
      success: true,
      statusCode: 200,
      message: 'Đã thêm kênh vào yêu thích',
      result: updated?.favoriteChannelIds ?? [],
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('favorites')
  async removeFavorite(
    @Req() req: Request,
    @Query('channelId') channelId: string,
  ) {
    const user = req.user as JwtUser;
    const userId = user.sub;
    const updated = await this.userService.removeFavoriteChannel(
      userId,
      channelId,
    );
    return {
      success: true,
      statusCode: 200,
      message: 'Đã xoá kênh khỏi yêu thích',
      result: updated?.favoriteChannelIds ?? [],
    };
  }
}
