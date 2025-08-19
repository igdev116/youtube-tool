import { Model, Types } from 'mongoose';
import { YoutubeChannel, YoutubeChannelDocument, YoutubeChannelSort } from './youtube-channel.schema';
import { BulkChannelDto } from './dto/bulk-channel.dto';
import { YoutubeWebsubService } from '../websub/youtube-websub.service';
import { UserService } from '../../user/user.service';
export declare class YoutubeChannelService {
    private readonly channelModel;
    private readonly websubService;
    private readonly userService;
    private readonly logger;
    constructor(channelModel: Model<YoutubeChannelDocument>, websubService: YoutubeWebsubService, userService: UserService);
    private addChannelError;
    addChannelsBulk(channels: BulkChannelDto[], userId: string): {
        error: boolean;
        message: string;
        docs: never[];
    };
    private processChannelsBulk;
    getUserChannelsWithPagination(userId: string, page: number, limit: number, keyword?: string, sortKey?: YoutubeChannelSort, favoriteOnly?: boolean): Promise<import("../../types/common.type").PagingResponseV2<YoutubeChannelDocument>>;
    private mapSort;
    deleteChannelById(userId: string, id: string): Promise<(import("mongoose").Document<unknown, {}, YoutubeChannelDocument, {}> & YoutubeChannel & import("mongoose").Document<unknown, any, any, Record<string, any>> & {
        user: Types.ObjectId | import("../../user/user.schema").User;
    } & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }) | null>;
    toggleChannelActive(userId: string, id: string): Promise<(import("mongoose").Document<unknown, {}, YoutubeChannelDocument, {}> & YoutubeChannel & import("mongoose").Document<unknown, any, any, Record<string, any>> & {
        user: Types.ObjectId | import("../../user/user.schema").User;
    } & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }) | null>;
    deleteAllUserChannels(userId: string): Promise<{
        deletedCount: number;
    }>;
    getAllUserChannels(userId: string, keyword?: string, sortKey?: YoutubeChannelSort, favoriteOnly?: boolean): Promise<YoutubeChannelDocument[] | (import("mongoose").FlattenMaps<YoutubeChannelDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    })[]>;
}
