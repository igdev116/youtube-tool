import { Model, Types } from 'mongoose';
import { TelegramGroup, TelegramGroupDocument } from './telegram-group.schema';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
export declare class TelegramGroupService {
    private readonly groupModel;
    constructor(groupModel: Model<TelegramGroupDocument>);
    createGroup(userId: string, dto: CreateGroupDto): Promise<import("mongoose").Document<unknown, {}, TelegramGroupDocument, {}> & TelegramGroup & import("mongoose").Document<unknown, any, any, Record<string, any>> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    getUserGroups(userId: string): Promise<(import("mongoose").FlattenMaps<TelegramGroupDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    })[]>;
    getGroupById(userId: string, groupId: string): Promise<import("mongoose").FlattenMaps<TelegramGroupDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    }>;
    updateGroup(userId: string, groupId: string, dto: UpdateGroupDto): Promise<import("mongoose").Document<unknown, {}, TelegramGroupDocument, {}> & TelegramGroup & import("mongoose").Document<unknown, any, any, Record<string, any>> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    deleteGroup(userId: string, groupId: string): Promise<{
        success: boolean;
    }>;
    addChannels(userId: string, groupId: string, channelIds: string[]): Promise<import("mongoose").Document<unknown, {}, TelegramGroupDocument, {}> & TelegramGroup & import("mongoose").Document<unknown, any, any, Record<string, any>> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    removeChannel(userId: string, groupId: string, channelId: string): Promise<import("mongoose").Document<unknown, {}, TelegramGroupDocument, {}> & TelegramGroup & import("mongoose").Document<unknown, any, any, Record<string, any>> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    getGroupsByChannelId(userId: Types.ObjectId, channelId: string): Promise<(import("mongoose").FlattenMaps<TelegramGroupDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    })[]>;
}
