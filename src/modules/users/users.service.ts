import { HttpStatus, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ApiResponseUtil } from 'src/common/utils/api-response.util';
import { applyExactFilters } from 'src/common/utils/filter.utils';
import { handleImageUpload } from 'src/common/utils/handle-image-upload.util';
import { paginate } from 'src/common/utils/paginate';
import { EntityManager, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { User } from './entities/user.entity';
import { UserStatus } from './interfaces/userStatus.interface';
import { UserRole } from './interfaces/userRole.interface';

@Injectable()
export class UsersService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(User) protected userRepository: Repository<User>,
  ) {}
  async create(user: CreateUserDto, role: UserRole, status: UserStatus) {
    const newUser = this.userRepository.create(user);
    newUser.role = role;
    newUser.status = status;
    await this.userRepository.save(newUser);
    this.eventEmitter.emit('user.created', newUser);
    return newUser;
  }

  async findAll(paginationDto: PaginationDto, filters: UserFilterDto) {
    const query = this.userRepository.createQueryBuilder('users');
    applyExactFilters(
      query,
      { status: filters.status, role: filters.role },
      'users',
    );
    return await paginate(query, paginationDto);
  }

  async findOneById(id: string, manager?: EntityManager) {
    // In case id is undefined or null without this it will return first value
    if (!id)
      return ApiResponseUtil.throwError(
        'User not found',
        'USER_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );

    const repo = manager ? manager.getRepository(User) : this.userRepository;
    const user = await repo.findOne({
      where: {
        id,
        status: UserStatus.ACTIVE,
      },
    });
    if (!user) {
      return ApiResponseUtil.throwError(
        'User not found',
        'USER_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
  }
  async findOne(email: string) {
    return await this.userRepository.findOneBy({ email });
  }

  async findOwnerRequests() {
    return await this.userRepository.findBy({
      role: UserRole.OWNER,
      status: UserStatus.PENDING,
    });
  }

  async acceptOwnerRequest(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      return ApiResponseUtil.throwError(
        'User not found',
        'USER_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }
    if (user.status !== UserStatus.PENDING) {
      return ApiResponseUtil.throwError(
        'User is not pending owner',
        'USER_NOT_PENDING',
        HttpStatus.BAD_REQUEST,
      );
    }
    user.status = UserStatus.ACTIVE;
    return await this.userRepository.save(user);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    files?: {
      avatar?: Express.Multer.File[];
    },
  ) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      return ApiResponseUtil.throwError(
        'User not found',
        'USER_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }
    const { avatar } = await handleImageUpload({
      avatar: files?.avatar,
    });
    if (avatar && avatar.length > 0) updateUserDto.avatar = avatar[0];
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }
}
