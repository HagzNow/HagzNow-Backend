import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OwnersService extends UsersService {
  constructor(
    eventEmitter: EventEmitter2,
    @InjectRepository(User) userRepository: Repository<User>,
  ) {
    super(eventEmitter, userRepository);
  }
}
