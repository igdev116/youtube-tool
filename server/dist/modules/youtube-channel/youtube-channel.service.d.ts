import { Model, Types } from 'mongoose';
import { YoutubeChannel, YoutubeChannelDocument } from './youtube-channel.schema';
import { BulkChannelDto } from './dto/bulk-channel.dto';
import { UserService } from '../../user/user.service';
import { TelegramBotService } from '../../telegram/telegram-bot.service';
import { TelegramQueueService } from '../queue/telegram-queue.service';
export declare class YoutubeChannelService {
    private readonly channelModel;
    private readonly userService;
    private readonly telegramBotService;
    private readonly telegramQueueService;
    private readonly logger;
    constructor(channelModel: Model<YoutubeChannelDocument>, userService: UserService, telegramBotService: TelegramBotService, telegramQueueService: TelegramQueueService);
    private getUserIdFromRef;
    private addChannelError;
    addChannelsBulk(channels: BulkChannelDto[], userId: string): Promise<{
        error: boolean;
        message: string;
        docs: YoutubeChannelDocument[];
    }>;
    getUserChannelsWithPagination(userId: string, page: number, limit: number, keyword?: string): Promise<import("../../types/common.type").PagingResponseV2<YoutubeChannelDocument>>;
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
    testCheckNewVideo(): Promise<void>;
    notifyAllChannelsNewVideo(): Promise<void>;
}
