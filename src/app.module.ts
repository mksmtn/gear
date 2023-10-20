import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { MessageModule } from './message';
import { ReplyModule } from './reply';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://mongodb:27017/gear'),
    MessageModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ReplyModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
