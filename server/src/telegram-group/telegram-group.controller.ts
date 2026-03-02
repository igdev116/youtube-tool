import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TelegramGroupService } from './telegram-group.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { BaseResponse } from '../types/common.type';

interface JwtUser {
  sub: string;
  username: string;
}

@UseGuards(JwtAuthGuard)
@Controller('groups')
export class TelegramGroupController {
  constructor(private readonly groupService: TelegramGroupService) {}

  @Post()
  async createGroup(
    @Body() dto: CreateGroupDto,
    @Req() req: Request,
  ): Promise<BaseResponse<any>> {
    const userId = (req.user as JwtUser).sub;
    const group = await this.groupService.createGroup(userId, dto);
    return {
      success: true,
      statusCode: 201,
      message: 'Tạo group thành công',
      result: group,
    };
  }

  @Get()
  async getUserGroups(@Req() req: Request): Promise<BaseResponse<any>> {
    const userId = (req.user as JwtUser).sub;
    const groups = await this.groupService.getUserGroups(userId);
    return {
      success: true,
      statusCode: 200,
      message: 'Lấy danh sách groups thành công',
      result: groups,
    };
  }

  @Patch(':id')
  async updateGroup(
    @Param('id') groupId: string,
    @Body() dto: UpdateGroupDto,
    @Req() req: Request,
  ): Promise<BaseResponse<any>> {
    const userId = (req.user as JwtUser).sub;
    const group = await this.groupService.updateGroup(userId, groupId, dto);
    return {
      success: true,
      statusCode: 200,
      message: 'Cập nhật group thành công',
      result: group,
    };
  }

  @Delete(':id')
  async deleteGroup(
    @Param('id') groupId: string,
    @Req() req: Request,
  ): Promise<BaseResponse<any>> {
    const userId = (req.user as JwtUser).sub;
    await this.groupService.deleteGroup(userId, groupId);
    return {
      success: true,
      statusCode: 200,
      message: 'Xóa group thành công',
      result: null,
    };
  }

  @Post(':id/channels')
  async addChannels(
    @Param('id') groupId: string,
    @Body() body: { channelIds: string[] },
    @Req() req: Request,
  ): Promise<BaseResponse<any>> {
    const userId = (req.user as JwtUser).sub;
    const group = await this.groupService.addChannels(
      userId,
      groupId,
      body.channelIds,
    );
    return {
      success: true,
      statusCode: 200,
      message: 'Thêm kênh vào group thành công',
      result: group,
    };
  }

  @Delete(':id/channels/:channelId')
  async removeChannel(
    @Param('id') groupId: string,
    @Param('channelId') channelId: string,
    @Req() req: Request,
  ): Promise<BaseResponse<any>> {
    const userId = (req.user as JwtUser).sub;
    const group = await this.groupService.removeChannel(
      userId,
      groupId,
      channelId,
    );
    return {
      success: true,
      statusCode: 200,
      message: 'Xóa kênh khỏi group thành công',
      result: group,
    };
  }
}
