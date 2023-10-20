import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Reply } from './reply.schema';
import { Model } from 'mongoose';

@Injectable()
export class ReplyService {
  constructor(
    @InjectModel(Reply.name) private readonly replyModel: Model<Reply>,
  ) {}

  async countErrors(): Promise<number> {
    return await this.replyModel.countDocuments({ isError: true });
  }

  async countPongs(): Promise<number> {
    return await this.replyModel.countDocuments({ isError: false });
  }
}
