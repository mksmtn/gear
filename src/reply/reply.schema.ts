import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ReplyDocument = HydratedDocument<Reply>;

@Schema()
export class Reply {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  payload: string;

  @Prop({ required: true })
  isError: boolean;
}

export const ReplySchema = SchemaFactory.createForClass(Reply);
