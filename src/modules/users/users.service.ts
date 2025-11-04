import { HttpStatus, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ApiResponseUtil } from 'src/common/utils/api-response.util';
import { applyFilters } from 'src/common/utils/filter.utils';
import { paginate } from 'src/common/utils/paginate';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { User } from './entities/user.entity';
import { UserRole } from './interfaces/userRole.interface';
import { UserStatus } from './interfaces/userStatus.interface';

@Injectable()
export class UsersService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const newUser = this.userRepository.create(createUserDto);
    await this.userRepository.save(newUser);
    this.eventEmitter.emit('user.created', newUser);
    return newUser;
  }

  async findAll(paginationDto: PaginationDto, filters: UserFilterDto) {
    const query = this.userRepository.createQueryBuilder('users');
    applyFilters(query, filters);
    return await paginate(query, paginationDto);
  }

  async findOneById(id: string) {
    // In case id is undefined or null without this it will return first value
    if (!id)
      return ApiResponseUtil.throwError(
        'User not found',
        'USER_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    return await this.userRepository.findOneBy({ id });
  }
  async findOne(email: string) {
    return await this.userRepository.findOneBy({ email });
  }

  async getStats() {
    const totalUsers = await this.userRepository.count();

    const totalOwners = await this.userRepository.count({
      where: { role: UserRole.OWNER },
    });

    const activeUsers = await this.userRepository.count({
      where: { status: UserStatus.ACTIVE },
    });

    return {
      totalUsers,
      totalOwners,
      activeUsers,
    };
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      return ApiResponseUtil.throwError(
        'User not found',
        'USER_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }
    user.status = UserStatus.DISABLED;
    return await this.userRepository.save(user);
  }
}
