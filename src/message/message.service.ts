import {
  GearApi,
  GearKeyring,
  decodeAddress,
  ProgramMetadata,
  HexString,
  MessageQueued,
} from '@gear-js/api';
import { readFile } from 'fs/promises';
import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from './message.schema';
import { Model } from 'mongoose';

// TODO: use env vars
const config = {
  metaPath: 'test_task.meta.txt',
  optPath: 'test_task.opt.wasm',
};

@Injectable()
export class MessageService {
  private readonly programId: HexString;
  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
    private readonly configService: ConfigService,
  ) {
    this.programId =
      this.configService.getOrThrow<HexString>('GEAR_PROGRAM_ID');
  }

  async sendMessage(): Promise<string> {
    const api = await GearApi.create({
      providerAddress: 'wss://testnet.vara-network.io',
    });

    // todo: use env vars
    const alice = GearKeyring.fromJson(
      {
        encoded:
          'DMMoruZWNhrNwgIjCxf9XLj5/HFngarmsPh87tQumKsAgAAAAQAAAAgAAABeAPH+IEEnr8gxE0Hpu50EQXbTKP53cKRy1H3iiR5lNRt3jCHqEZSZ1c8JqMojrsyeb4lSiR/Gik/JjfO6pm8gX3uYl1emYROCeyzm8uqYoowKVmSur1HFT901d52euO5t5lprAoQ6X7F5+wIGjhxJn7JNvI5/FOkiVLQePyQgqk3qqePrm68j4MeHuCUJ+RYJ3VohkfmPM//u8LlO',
        encoding: {
          content: ['pkcs8', 'sr25519'],
          type: ['scrypt', 'xsalsa20-poly1305'],
          version: '3',
        },
        address: '5EqftxHAw7Fwh9vrCYdvqHdzbfRK3sZLGNfjTW5FbYFjwUDQ',
        meta: {
          name: 'gear-test',
          whenCreated: 1697674608900,
          isHidden: false,
        },
      },
      '1q2w3e4r5',
    );

    const metaFile = await readFile(join(__dirname, '..', config.metaPath));
    const metaData = metaFile.toString();

    const meta = ProgramMetadata.from(`0x${metaData}`);

    const payload = 'Ping';

    const gas = await api.program.calculateGas.handle(
      decodeAddress(alice.address),
      this.programId,
      payload,
      0,
      true,
      meta,
    );

    const tx = await api.message.send(
      {
        destination: this.programId,
        payload,
        gasLimit: gas.min_limit,
        value: 0,
      },
      meta,
    );

    let messageId: HexString | undefined;
    await new Promise((resolve, reject) => {
      // todo: find a better type
      tx.signAndSend(alice, (event: any) => {
        // todo: use logger service
        console.log(`STATUS: ${event.status.toString()}`);
        if (event.status.isFinalized) {
          resolve(event.status.asFinalized);
        }
        // todo: find a better type
        event.events.forEach(({ event }: any) => {
          if (event.method === 'MessageQueued') {
            messageId = (event as MessageQueued).data.id.toHex();
          } else if (event.method === 'ExtrinsicFailed') {
            reject(api.getExtrinsicFailedError(event).docs.join('/n'));
          }
        });
      });
    });
    if (messageId === undefined) {
      throw new Error('MessageId has not been received');
    }
    console.log('MessageId', messageId);
    const createdMessage = new this.messageModel({ id: messageId, payload });
    await createdMessage.save();
    return messageId;
  }

  async countMessagesSent(): Promise<number> {
    return this.messageModel.estimatedDocumentCount();
  }
}
