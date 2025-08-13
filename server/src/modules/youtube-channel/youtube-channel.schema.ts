import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../user/user.schema';

export type YoutubeChannelDocument = YoutubeChannel &
  Document & { user: Types.ObjectId | User };

export enum ChannelErrorType {
  LINK_ERROR = 'LINK_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  SHORT_NOT_FOUND = 'SHORT_NOT_FOUND',
}

export enum YoutubeChannelSort {
  NEWEST_UPLOAD = 'NEWEST_UPLOAD',
  OLDEST_CHANNEL = 'OLDEST_CHANNEL',
  NEWEST_CHANNEL = 'NEWEST_CHANNEL',
}

@Schema()
export class YoutubeChannel {
  @Prop({ required: true, unique: true })
  channelId: string;

  @Prop({ required: true })
  xmlChannelId: string;

  @Prop({ required: true })
  lastVideoId: string;

  @Prop({ type: Date, required: true })
  lastVideoAt: Date;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user: Types.ObjectId | User;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [String], enum: Object.values(ChannelErrorType), default: [] })
  errors: ChannelErrorType[];
}

export const YoutubeChannelSchema =
  SchemaFactory.createForClass(YoutubeChannel);
