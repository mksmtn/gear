import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MessageDocument = HydratedDocument<Message>;

@Schema()
export class Message {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  payload: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
