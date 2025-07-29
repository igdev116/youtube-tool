import { YoutubeChannelService } from './youtube-channel.service';
import { BulkChannelDto } from './dto/bulk-channel.dto';
import { BaseResponse } from '../../types/common.type';
import { Request } from 'express';
export declare class YoutubeChannelController {
    private readonly channelService;
    constructor(channelService: YoutubeChannelService);
    addChannelsBulk(body: BulkChannelDto[], req: Request): Promise<BaseResponse<any>>;
    getUserChannels(req: Request, page: string, limit: string, keyword?: string): Promise<BaseResponse<any>>;
    testCheckNewVideo(): Promise<void>;
    deleteChannel(id: string, req: Request): Promise<BaseResponse<any>>;
    toggleChannelActive(id: string, req: Request): Promise<BaseResponse<any>>;
    resetAllLastVideoId(): Promise<BaseResponse<any>>;
    deleteAllChannelsWithErrors(): Promise<BaseResponse<any>>;
}
