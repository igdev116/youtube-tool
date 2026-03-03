import { Document, Types } from 'mongoose';
import { User } from '../user/user.schema';
export type TelegramGroupDocument = TelegramGroup & Document;
export declare class TelegramGroup {
    name: string;
    groupId: string;
    botToken: string;
    user: Types.ObjectId | User;
}
export declare const TelegramGroupSchema: import("mongoose").Schema<TelegramGroup, import("mongoose").Model<TelegramGroup, any, any, any, Document<unknown, any, TelegramGroup, any> & TelegramGroup & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, TelegramGroup, Document<unknown, {}, import("mongoose").FlatRecord<TelegramGroup>, {}> & import("mongoose").FlatRecord<TelegramGroup> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
