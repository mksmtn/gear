import { Controller, Delete, Get, Post } from '@nestjs/common';
import { MessageService } from './message';
import { ReplyService } from './reply/reply.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller()
export class AppController {
  constructor(
    private readonly replyService: ReplyService,
    private readonly messageService: MessageService,
    @InjectConnection()
    private readonly mongoose: Connection,
  ) {}

  @Get()
  async getStats() {
    return {
      messagesSent: await this.messageService.countMessagesSent(),
      errorsReceived: await this.replyService.countErrors(),
      pongsReceived: await this.replyService.countPongs(),
    };
  }

  @Post()
  async ping(): Promise<string> {
    return await this.messageService.sendMessage();
  }

  @Delete()
  async dropDatabase() {
    await this.mongoose.dropDatabase();
  }
}
