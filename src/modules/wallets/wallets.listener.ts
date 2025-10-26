import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { User } from 'src/modules/users/entities/user.entity';
import { WalletsService } from './wallets.service';

@Injectable()
export class WalletsListener {
  constructor(private readonly walletsService: WalletsService) {}

  // 👂 This listens to the "user.created" event
  @OnEvent('user.created')
  handleUserCreated(user: User) {
    this.walletsService.create(user);
  }
}
