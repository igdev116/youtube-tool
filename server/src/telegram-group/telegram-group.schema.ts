import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../user/user.schema';

export type TelegramGroupDocument = TelegramGroup & Document;

@Schema({ timestamps: true })
export class TelegramGroup {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  groupId: string;

  @Prop({ required: true })
  botToken: string;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user: Types.ObjectId | User;
}

export const TelegramGroupSchema = SchemaFactory.createForClass(TelegramGroup);
