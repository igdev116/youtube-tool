import {
  Controller,
  Get,
  Post,
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

  @Get(':id')
  async getGroupById(
    @Param('id') groupId: string,
    @Req() req: Request,
  ): Promise<BaseResponse<any>> {
    const userId = (req.user as JwtUser).sub;
    const group = await this.groupService.getGroupById(userId, groupId);
    return {
      success: true,
      statusCode: 200,
      message: 'Lấy thông tin group thành công',
      result: group,
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

  /**
   * GET /groups/:id/channels — lấy danh sách channels của group
   */
  @Get(':id/channels')
  async getGroupChannels(
    @Param('id') groupId: string,
    @Req() req: Request,
  ): Promise<BaseResponse<any>> {
    const userId = (req.user as JwtUser).sub;
    const channels = await this.groupService.getGroupChannels(userId, groupId);
    return {
      success: true,
      statusCode: 200,
      message: 'Lấy danh sách kênh của group thành công',
      result: channels,
    };
  }
}
