import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
  Query,
  Delete,
  Param,
} from '@nestjs/common';
import { YoutubeChannelService } from './youtube-channel.service';
import { BulkChannelDto } from './dto/bulk-channel.dto';
import { BaseResponse } from '../../types/common.type';

import { Request } from 'express';
import { JwtAuthGuard } from '~/auth/jwt-auth.guard';

interface JwtUser {
  sub: string;
  username: string;
}

@Controller('channel')
export class YoutubeChannelController {
  constructor(private readonly channelService: YoutubeChannelService) {}

  @UseGuards(JwtAuthGuard)
  @Post('bulk')
  async addChannelsBulk(
    @Body() body: BulkChannelDto[],
    @Req() req: Request,
  ): Promise<BaseResponse<any>> {
    const user = req.user as JwtUser;
    const userId = user.sub;
    const result = await this.channelService.addChannelsBulk(body, userId);
    if (result.error) {
      return {
        success: false,
        statusCode: 400,
        message: result.message || 'Thêm kênh thất bại',
        result: null,
      };
    }
    return {
      success: true,
      statusCode: 201,
      message: 'Đã thêm danh sách kênh thành công',
      result: result.docs,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('list')
  async getUserChannels(
    @Req() req: Request,
    @Query('limit') limit: string,
    @Query('cursor') cursor?: string,
  ): Promise<BaseResponse<any>> {
    const user = req.user as JwtUser;
    const userId = user.sub;
    const pageSize = Number(limit) || 10;
    const pagingResult =
      await this.channelService.getUserChannelsWithPagination(
        userId,
        pageSize,
        cursor,
      );
    return {
      success: true,
      statusCode: 200,
      message: 'Lấy danh sách kênh thành công',
      result: pagingResult.result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('test-check-new-video')
  async testCheckNewVideo() {
    return this.channelService.testCheckNewVideo();
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteChannel(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<BaseResponse<any>> {
    const user = req.user as JwtUser;
    const userId = user.sub;
    const deleted = await this.channelService.deleteChannelById(userId, id);
    if (!deleted) {
      return {
        success: false,
        statusCode: 404,
        message: 'Không tìm thấy kênh hoặc bạn không có quyền xoá',
        result: null,
      };
    }
    return {
      success: true,
      statusCode: 200,
      message: 'Xoá kênh thành công',
      result: deleted,
    };
  }
}
