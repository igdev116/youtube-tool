import { YoutubeChannelService } from './youtube-channel.service';
import { TelegramGroupService } from '../../telegram-group/telegram-group.service';
import { BulkChannelDto } from './dto/bulk-channel.dto';
import { BaseResponse } from '../../types/common.type';
import { GetChannelsDto } from './dto/get-channels.dto';
import { Request } from 'express';
export declare class YoutubeChannelController {
    private readonly channelService;
    private readonly groupService;
    constructor(channelService: YoutubeChannelService, groupService: TelegramGroupService);
    addChannelsBulk(body: {
        channels: BulkChannelDto[];
        groupIds?: string[];
        newGroupNames?: string[];
    }, req: Request): Promise<BaseResponse<any>>;
    getUserChannels(req: Request, body: GetChannelsDto): Promise<BaseResponse<any>>;
    exportUserChannels(req: Request): Promise<BaseResponse<any>>;
    deleteAllUserChannels(req: Request): Promise<BaseResponse<any>>;
    deleteChannel(id: string, req: Request): Promise<BaseResponse<any>>;
    toggleChannelActive(id: string, req: Request): Promise<BaseResponse<any>>;
    addChannelToGroup(channelDbId: string, groupId: string, req: Request): Promise<BaseResponse<any>>;
    removeChannelFromGroup(channelDbId: string, groupId: string, req: Request): Promise<BaseResponse<any>>;
}
