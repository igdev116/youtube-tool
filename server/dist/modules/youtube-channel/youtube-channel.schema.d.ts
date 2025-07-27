import { Document, Types } from 'mongoose';
import { User } from '../../user/user.schema';
export type YoutubeChannelDocument = YoutubeChannel & Document & {
    user: Types.ObjectId | User;
};
export declare enum ChannelErrorType {
    LINK_ERROR = "LINK_ERROR",
    NETWORK_ERROR = "NETWORK_ERROR",
    PARSE_ERROR = "PARSE_ERROR",
    RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR"
}
export declare class YoutubeChannel {
    channelId: string;
    lastVideoId?: string;
    lastVideoAt?: Date;
    user: Types.ObjectId | User;
    isActive: boolean;
    errors: ChannelErrorType[];
}
export declare const YoutubeChannelSchema: import("mongoose").Schema<YoutubeChannel, import("mongoose").Model<YoutubeChannel, any, any, any, Document<unknown, any, YoutubeChannel, any> & YoutubeChannel & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, YoutubeChannel, Document<unknown, {}, import("mongoose").FlatRecord<YoutubeChannel>, {}> & import("mongoose").FlatRecord<YoutubeChannel> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
