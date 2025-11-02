import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
export declare class UsersService {
    private readonly eventEmitter;
    private userRepository;
    constructor(eventEmitter: EventEmitter2, userRepository: Repository<User>);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(): Promise<User[]>;
    findOneById(id: string): Promise<User | null>;
    findOne(email: string): Promise<User | null>;
    update(id: string, updateUserDto: UpdateUserDto): string;
    remove(id: string): string;
}
