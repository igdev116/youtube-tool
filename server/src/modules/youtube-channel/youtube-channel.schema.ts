import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../user/user.schema';

export type YoutubeChannelDocument = YoutubeChannel &
  Document & { user: Types.ObjectId | User };

@Schema({ timestamps: true })
export class YoutubeChannel {
  @Prop({ required: true, unique: true })
  channelId: string;

  @Prop({ required: false })
  lastVideoId?: string;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user: Types.ObjectId | User;

  @Prop({ default: true })
  isActive: boolean;
}

export const YoutubeChannelSchema =
  SchemaFactory.createForClass(YoutubeChannel);
