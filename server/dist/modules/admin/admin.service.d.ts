import { Model } from 'mongoose';
import { YoutubeChannelDocument } from '../youtube-channel/youtube-channel.schema';
import { UserDocument } from '../../user/user.schema';
import { GetUsersDto } from './dto/get-users.dto';
import { UserAdminResponseDto } from './dto/user-admin-response.dto';
import { GetUserChannelsDto } from './dto/get-user-channels.dto';
import { PagingResponseV2 } from '../../types/common.type';
export declare class AdminService {
    private readonly channelModel;
    private readonly userModel;
    constructor(channelModel: Model<YoutubeChannelDocument>, userModel: Model<UserDocument>);
    deleteAllChannels(): Promise<{
        success: boolean;
        message: string;
        deletedCount: number;
    }>;
    getChannelStats(): Promise<{
        success: boolean;
        message: string;
        result: {
            totalChannels: number;
            activeChannels: number;
            channelsWithErrors: number;
            inactiveChannels: number;
        };
    }>;
    resetAllLastVideoId(): Promise<{
        success: boolean;
        message: string;
        modifiedCount: number;
    }>;
    deleteAllChannelsWithErrors(): Promise<{
        success: boolean;
        message: string;
        deletedCount: number;
    }>;
    getUsersList(params: GetUsersDto): Promise<{
        success: boolean;
        message: string;
        result: {
            content: UserAdminResponseDto[];
            paging: {
                total: number;
                hasMore: boolean;
            };
        };
    }>;
    getUserById(userId: string): Promise<any>;
    getUserChannels(userId: string, params: GetUserChannelsDto): Promise<PagingResponseV2<any>>;
    deleteUser(userId: string): Promise<{
        success: boolean;
        message: string;
        deletedChannels: number;
        deletedUser: number;
    }>;
    deleteUserChannel(userId: string, channelId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
