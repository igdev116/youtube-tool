import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { BaseResponse, PagingResponseV2 } from '../../types/common.type';
import { GetUsersDto } from './dto/get-users.dto';
import { UserAdminResponseDto } from './dto/user-admin-response.dto';
import { GetUserChannelsDto } from './dto/get-user-channels.dto';

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

  @Post('users')
  async getUsersList(
    @Body() params: GetUsersDto,
  ): Promise<PagingResponseV2<UserAdminResponseDto>> {
    const result = await this.adminService.getUsersList(params);
    return {
      success: true,
      statusCode: 200,
      message: result.message,
      result: result.result,
    };
  }

  @Get('users/:userId')
  async getUser(
    @Param('userId') userId: string,
  ): Promise<BaseResponse<UserAdminResponseDto>> {
    const user = await this.adminService.getUserById(userId);

    if (!user) {
      return {
        success: false,
        statusCode: 404,
        message: 'User không tồn tại',
        result: null as any,
      };
    }

    return {
      success: true,
      statusCode: 200,
      message: 'Lấy thông tin user thành công',
      result: user as any,
    };
  }

  @Get('users/:userId/channels')
  async getUserChannels(
    @Param('userId') userId: string,
    @Query() params: GetUserChannelsDto,
  ): Promise<PagingResponseV2<any>> {
    const result = await this.adminService.getUserChannels(userId, params);
    return {
      ...result,
    };
  }

  @Delete('users/:userId/channels/:channelId')
  async deleteUserChannel(
    @Param('userId') userId: string,
    @Param('channelId') channelId: string,
  ): Promise<BaseResponse<any>> {
    const result = await this.adminService.deleteUserChannel(userId, channelId);
    return {
      success: result.success,
      statusCode: result.success ? 200 : 400,
      message: result.message,
      result: null,
    };
  }

  @Delete('users/:userId')
  async deleteUser(
    @Param('userId') userId: string,
  ): Promise<BaseResponse<any>> {
    const result = await this.adminService.deleteUser(userId);
    return {
      success: true,
      statusCode: 200,
      message: result.message,
      result: {
        deletedChannels: result.deletedChannels,
        deletedUser: result.deletedUser,
      },
    };
  }

  @Post('migrate-user-objectid')
  async migrateUserField(): Promise<BaseResponse<any>> {
    const result = await this.adminService.migrateUserFieldToObjectId();
    return {
      success: true,
      statusCode: 200,
      message: result.message,
      result: {
        count: result.count,
      },
    };
  }
}
