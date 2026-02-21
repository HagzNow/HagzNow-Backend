import { HttpStatus, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ApiResponseUtil } from 'src/common/utils/api-response.util';
import { applyExactFilters } from 'src/common/utils/filter.utils';
import { paginate } from 'src/common/utils/paginate';
import { EntityManager, Not, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { SubmitOwnerVerificationDto } from './dto/submit-owner-verification.dto';
import { User } from './entities/user.entity';
import { UserStatus } from './interfaces/userStatus.interface';
import { UserRole } from './interfaces/userRole.interface';
import { USER_CREATED } from 'src/common/event.constants';
import { UploadService } from '../upload/upload.service';
import { Language } from 'src/common/enums/language.enum';

@Injectable()
export class UsersService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(User) protected userRepository: Repository<User>,
    private readonly uploadService: UploadService,
  ) {}
  async create(user: CreateUserDto, role: UserRole, status: UserStatus) {
    const newUser = this.userRepository.create(user);
    newUser.role = role;
    newUser.status = status;
    await this.userRepository.save(newUser);
    this.eventEmitter.emit(USER_CREATED, newUser);
    return newUser;
  }

  async findAll(filters: UserFilterDto) {
    const { page, limit } = filters;
    const query = this.userRepository.createQueryBuilder('users');
    applyExactFilters(
      query,
      { status: filters.status, role: filters.role },
      'users',
    );
    return await paginate(query, { page, limit });
  }

  async findOneById(
    userId: string,
    manager?: EntityManager,
  ): Promise<User | never> {
    // In case id is undefined or null without this it will return first value
    if (!userId)
      return ApiResponseUtil.throwError(
        'errors.auth.user_not_found',
        'USER_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );

    const repo = manager ? manager.getRepository(User) : this.userRepository;
    const user = await repo.findOne({
      where: {
        id: userId,
        status: UserStatus.ACTIVE,
      },
    });
    if (!user) {
      return ApiResponseUtil.throwError(
        'errors.auth.user_not_found',
        'USER_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
  }

  /**
   * Find user by id for profile fetch. Allows ACTIVE, PENDING, or REJECTED so that
   * PENDING owners can see verification state and REJECTED users can see rejection reason.
   */
  async findOneByIdForProfile(userId: string): Promise<User | never> {
    if (!userId)
      return ApiResponseUtil.throwError(
        'errors.auth.user_not_found',
        'USER_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );

    const user = await this.userRepository.findOne({
      where: [{ id: userId, status: Not(UserStatus.RESTRICTED) }],
    });
    if (!user) {
      return ApiResponseUtil.throwError(
        'errors.auth.user_not_found',
        'USER_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
  }
  async findOneByEmail(email: string) {
    return await this.userRepository.findOneBy({ email });
  }

  async findOneByPhone(phone: string) {
    return await this.userRepository.findOneBy({ phone });
  }

  async findOwnerRequests(paginationDto: PaginationDto) {
    const query = await this.userRepository.createQueryBuilder('users');
    query.where('users.role = :role', { role: UserRole.OWNER });
    query.andWhere('users.status = :status', { status: UserStatus.PENDING });
    return await paginate(query, paginationDto);
  }

  private async updateStatus(
    userId: string,
    status: UserStatus,
  ): Promise<User | never> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      return ApiResponseUtil.throwError(
        'errors.auth.user_not_found',
        'USER_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }
    if (user.status != UserStatus.PENDING) {
      return ApiResponseUtil.throwError(
        'errors.owner_request.not_pending',
        'OWNER_REQUEST_NOT_PENDING',
        HttpStatus.BAD_REQUEST,
      );
    }
    user.status = status;
    return await this.userRepository.save(user);
  }

  async acceptOwnerRequest(userId: string) {
    await this.updateStatus(userId, UserStatus.ACTIVE);
    return { message: 'messages.auth.owner_request.accepted' };
  }

  async rejectOwnerRequest(userId: string, reason?: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      return ApiResponseUtil.throwError(
        'errors.auth.user_not_found',
        'USER_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }
    if (user.status !== UserStatus.PENDING) {
      return ApiResponseUtil.throwError(
        'errors.owner_request.not_pending',
        'OWNER_REQUEST_NOT_PENDING',
        HttpStatus.BAD_REQUEST,
      );
    }
    user.status = UserStatus.REJECTED;
    user.rejectionReason = reason;
    await this.userRepository.save(user);
    return { message: 'messages.auth.owner_request.rejected' };
  }

  async submitVerificationImages(
    user: User,
    dto: SubmitOwnerVerificationDto,
  ): Promise<User | never> {
    if (user.role !== UserRole.OWNER) {
      return ApiResponseUtil.throwError(
        'errors.general.forbidden',
        'FORBIDDEN',
        HttpStatus.FORBIDDEN,
      );
    }
    const fields: (keyof SubmitOwnerVerificationDto)[] = [
      'nationalIdFront',
      'nationalIdBack',
      'selfieWithId',
    ];
    for (const field of fields) {
      const newPath = dto[field];
      const oldPath = user[field];
      if (newPath && newPath !== oldPath && oldPath) {
        await this.uploadService.deleteImage(oldPath);
      }
    }
    user.nationalIdFront = dto.nationalIdFront;
    user.nationalIdBack = dto.nationalIdBack;
    user.selfieWithId = dto.selfieWithId;
    return await this.userRepository.save(user);
  }
  private async validateUserCanUpdateAndFetch(userId: string): Promise<User> {
    const user = await this.findOneById(userId);
    if (user.status !== UserStatus.ACTIVE) {
      return ApiResponseUtil.throwError(
        'errors.auth.account_inactive',
        'INACTIVE_ACCOUNT',
        HttpStatus.FORBIDDEN,
      );
    }
    return user;
  }

  async update(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User | never> {
    const user = await this.validateUserCanUpdateAndFetch(userId);
    // Handle avatar replacement: delete old avatar file if path changed
    if (
      updateUserDto.avatar &&
      updateUserDto.avatar !== user.avatar &&
      user.avatar
    ) {
      await this.uploadService.deleteImage(user.avatar);
    }

    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async updatePhone(
    userId: string,
    newPhone: string,
  ): Promise<{ message: string } | never> {
    const user = await this.validateUserCanUpdateAndFetch(userId);
    // ensure different phone number
    if (user.phone === newPhone) {
      return ApiResponseUtil.throwError(
        'errors.auth.same_phone_number',
        'SAME_PHONE_NUMBER',
        HttpStatus.BAD_REQUEST,
      );
    }
    // ensure unique phone number
    const existingUser = await this.userRepository.findOneBy({
      phone: newPhone,
    });
    if (existingUser && existingUser.id !== user.id) {
      return ApiResponseUtil.throwError(
        'errors.auth.phone_already_exists',
        'PHONE_NUMBER_IN_USE',
        HttpStatus.BAD_REQUEST,
      );
    }
    this.eventEmitter.emit('phoneNumberUpdated', {
      oldPhone: user.phone,
      newPhone: newPhone,
    });
    user.phone = newPhone;
    await this.userRepository.save(user);
    return { message: 'messages.user.phone_updated_successfully' };
  }

  async updateEmail(
    userId: string,
    newEmail: string,
  ): Promise<{ message: string } | never> {
    const user = await this.validateUserCanUpdateAndFetch(userId);
    // ensure different email
    if (user.email === newEmail) {
      return ApiResponseUtil.throwError(
        'errors.auth.same_email',
        'SAME_EMAIL',
        HttpStatus.BAD_REQUEST,
      );
    }
    // ensure unique email
    const existingUser = await this.findOneByEmail(newEmail);
    if (existingUser && existingUser.id !== user.id) {
      return ApiResponseUtil.throwError(
        'errors.auth.email_already_exists',
        'EMAIL_IN_USE',
        HttpStatus.BAD_REQUEST,
      );
    }
    user.email = newEmail;
    await this.userRepository.save(user);
    return { message: 'messages.user.email_updated_successfully' };
  }

  async updateLanguage(
    userId: string,
    newLanguage: Language,
  ): Promise<{ message: string } | never> {
    const user = await this.validateUserCanUpdateAndFetch(userId);
    if (user.language === newLanguage) {
      return ApiResponseUtil.throwError(
        'errors.validation.same_language',
        'SAME_LANGUAGE',
        HttpStatus.BAD_REQUEST,
      );
    }
    user.language = newLanguage;
    await this.userRepository.save(user);
    return { message: 'messages.user.language_updated_successfully' };
  }

  async updatePassword(
    userId: string,
    newPassword: string,
  ): Promise<{ message: string } | never> {
    const user = await this.validateUserCanUpdateAndFetch(userId);
    if (user.password === newPassword) {
      return ApiResponseUtil.throwError(
        'errors.auth.same_password',
        'SAME_PASSWORD',
        HttpStatus.BAD_REQUEST,
      );
    }

    user.password = newPassword;
    await this.userRepository.save(user);
    return { message: 'messages.user.password_updated_successfully' };
  }
}
