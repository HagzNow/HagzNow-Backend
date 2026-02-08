import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { User } from 'src/modules/users/entities/user.entity';
import { WalletsService } from './wallets.service';
import { USER_CREATED } from 'src/common/event.constants';

@Injectable()
export class WalletsListener {
  constructor(private readonly walletsService: WalletsService) {}

  // 👂 This listens to the "user.created" event
  @OnEvent(USER_CREATED)
  handleUserCreated(user: User) {
    this.walletsService.create(user);
  }
}
