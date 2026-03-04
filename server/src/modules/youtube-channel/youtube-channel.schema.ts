import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../user/user.schema';
import { TelegramGroup } from '../../telegram-group/telegram-group.schema';

export type YoutubeChannelDocument = YoutubeChannel &
  Document & { user: Types.ObjectId | User };

export enum YoutubeChannelSort {
  NEWEST_UPLOAD = 'NEWEST_UPLOAD',
  OLDEST_UPLOAD = 'OLDEST_UPLOAD',
  NO_GROUP = 'NO_GROUP',
}

@Schema()
export class YoutubeChannel {
  @Prop({ required: true })
  channelId: string;

  @Prop({ required: true })
  xmlChannelId: string;

  @Prop({ required: false })
  lastVideoId: string;

  @Prop({ type: Date, required: false })
  lastVideoAt: Date;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user: Types.ObjectId | User;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: false })
  avatarId?: string;

  @Prop({ type: Date, required: false })
  lastSubscribeAt: Date;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'TelegramGroup' }],
    default: [],
    index: true,
  })
  groups: Types.ObjectId[] | TelegramGroup[];
}

export const YoutubeChannelSchema =
  SchemaFactory.createForClass(YoutubeChannel);
