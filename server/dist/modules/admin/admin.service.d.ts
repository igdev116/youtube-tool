import { Model } from 'mongoose';
import { YoutubeChannelDocument } from '../youtube-channel/youtube-channel.schema';
export declare class AdminService {
    private readonly channelModel;
    constructor(channelModel: Model<YoutubeChannelDocument>);
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
}
