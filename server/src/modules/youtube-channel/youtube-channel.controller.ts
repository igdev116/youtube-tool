import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Delete,
  Param,
  Patch,
} from '@nestjs/common';
import { YoutubeChannelService } from './youtube-channel.service';
import { BulkChannelDto } from './dto/bulk-channel.dto';
import { BaseResponse } from '../../types/common.type';
import { GetChannelsDto } from './dto/get-channels.dto';

import { Request } from 'express';
import { JwtAuthGuard } from '~/auth/jwt-auth.guard';
import { YoutubeChannelSort } from './youtube-channel.schema';

interface JwtUser {
  sub: string;
  username: string;
}

@Controller('channel')
export class YoutubeChannelController {
  constructor(private readonly channelService: YoutubeChannelService) {}

  @UseGuards(JwtAuthGuard)
  @Post('bulk')
  addChannelsBulk(
    @Body() body: BulkChannelDto[],
    @Req() req: Request,
  ): BaseResponse<any> {
    const user = req.user as JwtUser;
    const userId = user.sub;
    const result = this.channelService.addChannelsBulk(body, userId);
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
  @Post('list')
  async getUserChannels(
    @Req() req: Request,
    @Body() body: GetChannelsDto,
  ): Promise<BaseResponse<any>> {
    const user = req.user as JwtUser;
    const userId = user.sub;
    const pageNum = Number(body.page) || 1;
    const pageSize = Number(body.limit) || 10;
    const pagingResult =
      await this.channelService.getUserChannelsWithPagination(
        userId,
        pageNum,
        pageSize,
        body.keyword,
        body.sort as YoutubeChannelSort,
        !!body.favoriteOnly,
      );
    return {
      success: true,
      statusCode: 200,
      message: 'Lấy danh sách kênh thành công',
      result: pagingResult.result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('export')
  async exportUserChannels(@Req() req: Request): Promise<BaseResponse<any>> {
    const user = req.user as JwtUser;
    const userId = user.sub;
    const channels = await this.channelService.getAllUserChannels(userId);
    console.log('channels :', channels.length);
    return {
      success: true,
      statusCode: 200,
      message: 'Xuất danh sách kênh thành công',
      result: channels,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('all')
  async deleteAllUserChannels(@Req() req: Request): Promise<BaseResponse<any>> {
    const user = req.user as JwtUser;
    const userId = user.sub;
    const { deletedCount } =
      await this.channelService.deleteAllUserChannels(userId);
    return {
      success: true,
      statusCode: 200,
      message: `Đã xoá ${deletedCount} kênh của bạn`,
      result: { deletedCount },
    };
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

  @UseGuards(JwtAuthGuard)
  @Patch(':id/toggle')
  async toggleChannelActive(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<BaseResponse<any>> {
    const user = req.user as JwtUser;
    const userId = user.sub;
    const channel = await this.channelService.toggleChannelActive(userId, id);

    if (!channel) {
      return {
        success: false,
        statusCode: 404,
        message: 'Không tìm thấy kênh hoặc bạn không có quyền thay đổi',
        result: null,
      };
    }

    return {
      success: true,
      statusCode: 200,
      message: `Đã ${channel.isActive ? 'bật' : 'tắt'} kênh thành công`,
      result: channel,
    };
  }
}
