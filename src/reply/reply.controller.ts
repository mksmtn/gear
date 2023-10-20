import { GearApi, HexString } from '@gear-js/api';
import { Bytes, U8aFixed } from '@polkadot/types-codec';
import { Controller, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reply } from './reply.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

function isError(payload: Bytes) {
  return payload.toHex() === '0x010100';
}

@Controller()
export class ReplyController implements OnModuleInit, OnModuleDestroy {
  private unsub?: () => void;

  constructor(
    @InjectModel(Reply.name) private readonly replyModel: Model<Reply>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const api = await GearApi.create({
      providerAddress: 'wss://testnet.vara-network.io',
    });
    this.unsub = await api.gearEvents.subscribeToGearEvent(
      'UserMessageSent', // pass here name of event you're interested in
      ({
        data: {
          message: { id, source, payload },
        },
      }) => {
        if (this.shouldIgnoreEvent(source)) {
          return;
        }
        const document = { payload: payload.toUtf8(), id: id.toHex() };
        if (isError(payload)) {
          this.saveError(document);
          return;
        }
        this.saveReply(document);
      },
    );
  }

  onModuleDestroy() {
    this.unsub?.();
  }

  private shouldIgnoreEvent(source: U8aFixed): boolean {
    return (
      source.toHex() !==
      this.configService.getOrThrow<HexString>('GEAR_PROGRAM_ID')
    );
  }

  private async saveError(error: { payload: string; id: string }) {
    console.log('Got error', error);
    const createdReply = new this.replyModel({ ...error, isError: true });
    return await createdReply.save();
  }

  private async saveReply(reply: { payload: string; id: string }) {
    console.log('Got reply', reply);
    const createdReply = new this.replyModel({ ...reply, isError: false });
    return await createdReply.save();
  }
}
