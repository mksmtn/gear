import { Module } from '@nestjs/common';
import { ReplyController } from './reply.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Reply, ReplySchema } from './reply.schema';
import { ReplyService } from './reply.service';

@Module({
  controllers: [ReplyController],
  imports: [
    MongooseModule.forFeature([{ name: Reply.name, schema: ReplySchema }]),
  ],
  providers: [ReplyService],
  exports: [ReplyService],
})
export class ReplyModule {}
