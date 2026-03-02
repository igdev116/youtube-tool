import { TelegramGroupService } from './telegram-group.service';
import { Request } from 'express';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { BaseResponse } from '../types/common.type';
export declare class TelegramGroupController {
    private readonly groupService;
    constructor(groupService: TelegramGroupService);
    createGroup(dto: CreateGroupDto, req: Request): Promise<BaseResponse<any>>;
    getUserGroups(req: Request): Promise<BaseResponse<any>>;
    updateGroup(groupId: string, dto: UpdateGroupDto, req: Request): Promise<BaseResponse<any>>;
    deleteGroup(groupId: string, req: Request): Promise<BaseResponse<any>>;
    addChannels(groupId: string, body: {
        channelIds: string[];
    }, req: Request): Promise<BaseResponse<any>>;
    removeChannel(groupId: string, channelId: string, req: Request): Promise<BaseResponse<any>>;
}
