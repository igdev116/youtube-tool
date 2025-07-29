import { Controller, Post, Get } from '@nestjs/common';
import { AdminService } from './admin.service';
import { BaseResponse } from '../../types/common.type';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('delete-all-channels')
  async deleteAllChannels(): Promise<BaseResponse<any>> {
    const result = await this.adminService.deleteAllChannels();
    return {
      success: true,
      statusCode: 200,
      message: result.message,
      result: {
        deletedCount: result.deletedCount,
      },
    };
  }

  @Get('channel-stats')
  async getChannelStats(): Promise<BaseResponse<any>> {
    const result = await this.adminService.getChannelStats();
    return {
      success: true,
      statusCode: 200,
      message: result.message,
      result: result.result,
    };
  }

  @Post('reset-last-video-id')
  async resetAllLastVideoId(): Promise<BaseResponse<any>> {
    const result = await this.adminService.resetAllLastVideoId();
    return {
      success: true,
      statusCode: 200,
      message: result.message,
      result: {
        modifiedCount: result.modifiedCount,
      },
    };
  }

  @Post('delete-channels-with-errors')
  async deleteAllChannelsWithErrors(): Promise<BaseResponse<any>> {
    const result = await this.adminService.deleteAllChannelsWithErrors();
    return {
      success: true,
      statusCode: 200,
      message: result.message,
      result: {
        deletedCount: result.deletedCount,
      },
    };
  }
}
