import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateCourtDto } from './dto/update-court.dto';
import { ApiResponseUtil } from 'src/common/utils/api-response.util';
import { EntityManager, In, IsNull, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Court } from './entities/court.entity';
import { CreateCourtDto } from './dto/create-court.dto';
import { ArenasService } from '../arenas/arenas.service';
import { Arena } from '../arenas/entities/arena.entity';
import { CourtStatus } from './interfaces/court-status.interface';

@Injectable()
export class CourtsService {
  constructor(
    @InjectRepository(Court)
    private readonly courtRepository: Repository<Court>,
    @Inject(forwardRef(() => ArenasService))
    private readonly arenasService: ArenasService,
  ) {}

  validateAllCourtsBelongToSameArena(
    courts: Court[],
    arena: Arena,
  ): void | never {
    if (!courts || courts.length === 0) {
      return;
    }
    for (const court of courts) {
      if (court.arena.id !== arena.id) {
        ApiResponseUtil.throwError(
          'errors.court.different_arenas',
          'COURTS_BELONG_TO_DIFFERENT_ARENAS',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  validateAllCourtsAreActive(courts: Court[]): void | never {
    if (!courts || courts.length === 0) {
      return;
    }
    for (const court of courts) {
      if (court.deletedAt || court.status !== CourtStatus.ACTIVE) {
        ApiResponseUtil.throwError(
          'errors.court.inactive',
          'INACTIVE_COURT',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  async create(
    createCourtDto: CreateCourtDto,
    arenaId: string,
    owner: User,
  ): Promise<Court | never> {
    const arena = await this.arenasService.findOne(arenaId);
    if (arena.owner.id !== owner.id) {
      return ApiResponseUtil.throwError(
        'errors.court.unauthorized_update',
        'UNAUTHORIZED',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const court = this.courtRepository.create({
      name: createCourtDto.name,
      arena: arena,
    });
    return await this.courtRepository.save(court);
  }

  async createMany(
    dtos: CreateCourtDto[],
    arenaId: string,
    manager?: EntityManager,
  ): Promise<Court[]> {
    const repo = manager ? manager.getRepository(Court) : this.courtRepository;
    const arena = await this.arenasService.findOne(arenaId, manager);
    const courts = dtos.map((dto) =>
      repo.create({
        name: dto.name,
        arena: arena,
      }),
    );
    return await repo.save(courts);
  }

  async findByArena(
    arenaId: string,
    status?: CourtStatus,
    manager?: EntityManager,
  ): Promise<Court[]> {
    const repo = manager ? manager.getRepository(Court) : this.courtRepository;
    return await repo.find({
      where: { arena: { id: arenaId }, status, deletedAt: IsNull() },
    });
  }

  async findOne(id: string, manager?: EntityManager): Promise<Court | never> {
    // In case id is undefined or null without this it will return first value
    if (!id)
      return ApiResponseUtil.throwError(
        'errors.court.not_found',
        'COURT_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );

    const repo = manager ? manager.getRepository(Court) : this.courtRepository;
    const court = await repo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: { arena: { owner: true } },
    });
    if (!court) {
      return ApiResponseUtil.throwError(
        'errors.court.not_found',
        'COURT_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }
    return court;
  }
  async findManyByIds(
    ids: string[],
    manager?: EntityManager,
  ): Promise<Court[]> {
    if (!ids || ids.length === 0) {
      return [];
    }
    const repo = manager ? manager.getRepository(Court) : this.courtRepository;
    // Check for duplicates
    const uniqueIds = Array.from(new Set(ids));
    if (ids.length !== uniqueIds.length) {
      return ApiResponseUtil.throwError(
        'errors.court.duplicate_ids',
        'COURT_DUPLICATE_IDS',
        HttpStatus.BAD_REQUEST,
      );
    }
    const courts = await repo.find({
      where: { id: In(ids), deletedAt: IsNull() },
      relations: { arena: { owner: true } },
    });
    if (courts.length !== ids.length) {
      return ApiResponseUtil.throwError(
        'errors.court.not_found',
        'COURT_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }
    return courts;
  }

  async update(
    id: string,
    updateCourtDto: UpdateCourtDto,
    owner: User,
  ): Promise<Court | never> {
    const court = await this.findOne(id);

    if (!court) {
      return ApiResponseUtil.throwError(
        'errors.court.not_found',
        'COURT_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }
    if (court.arena.owner.id !== owner.id) {
      return ApiResponseUtil.throwError(
        'errors.court.unauthorized_update',
        'UNAUTHORIZED',
        HttpStatus.UNAUTHORIZED,
      );
    }
    if (court.deletedAt) {
      return ApiResponseUtil.throwError(
        'errors.court.not_found',
        'INACTIVE_COURT',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (updateCourtDto.status && updateCourtDto.status === court.status) {
      return ApiResponseUtil.throwError(
        'errors.court.status_not_changed',
        'COURT_STATUS_NOT_CHANGED',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (updateCourtDto.name && updateCourtDto.name === court.name) {
      return ApiResponseUtil.throwError(
        'errors.court.name_not_changed',
        'COURT_NAME_NOT_CHANGED',
        HttpStatus.BAD_REQUEST,
      );
    }
    Object.assign(court, updateCourtDto);
    court.updatedAt = new Date();

    await this.courtRepository.save(court);

    return await this.findOne(id);
  }

  async remove(id: string, user: User): Promise<void | never> {
    const court = await this.findOne(id);
    if (court.arena.owner.id !== user.id) {
      return ApiResponseUtil.throwError(
        'errors.court.unauthorized_update',
        'UNAUTHORIZED',
        HttpStatus.UNAUTHORIZED,
      );
    }

    court.deletedAt = new Date();
    await this.courtRepository.save(court);
  }
}
