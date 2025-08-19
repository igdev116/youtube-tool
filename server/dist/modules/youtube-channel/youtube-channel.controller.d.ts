import { YoutubeChannelService } from './youtube-channel.service';
import { BulkChannelDto } from './dto/bulk-channel.dto';
import { BaseResponse } from '../../types/common.type';
import { GetChannelsDto } from './dto/get-channels.dto';
import { Request } from 'express';
export declare class YoutubeChannelController {
    private readonly channelService;
    constructor(channelService: YoutubeChannelService);
    addChannelsBulk(body: BulkChannelDto[], req: Request): BaseResponse<any>;
    getUserChannels(req: Request, body: GetChannelsDto): Promise<BaseResponse<any>>;
    exportUserChannels(req: Request, body: GetChannelsDto): Promise<BaseResponse<any>>;
    deleteAllUserChannels(req: Request): Promise<BaseResponse<any>>;
    deleteChannel(id: string, req: Request): Promise<BaseResponse<any>>;
    toggleChannelActive(id: string, req: Request): Promise<BaseResponse<any>>;
}
