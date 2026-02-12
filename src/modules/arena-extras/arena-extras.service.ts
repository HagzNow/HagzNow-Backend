import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArenaExtra } from './entities/arena-extra.entity';
import { EntityManager, In, IsNull, Repository } from 'typeorm';
import { ApiResponseUtil } from 'src/common/utils/api-response.util';

@Injectable()
export class ArenaExtrasService {
  constructor(
    @InjectRepository(ArenaExtra)
    private readonly extraRepository: Repository<ArenaExtra>,
  ) {}

  async getActiveExtras(arenaId: string) {
    return this.extraRepository.find({
      where: { arena: { id: arenaId }, cancelledAt: IsNull() },
    });
  }

  async findArenaExtrasByIds(
    arenaId: string,
    extraIds: string[],
    manager?: EntityManager,
  ) {
    const repo = manager
      ? manager.getRepository(ArenaExtra)
      : this.extraRepository;
    const extras = await repo.findBy({
      arena: { id: arenaId },
      id: In(extraIds || []),
      cancelledAt: IsNull(),
    });
    if (extras.length !== (extraIds || []).length) {
      return ApiResponseUtil.throwError(
        'errors.arena.extra.not_found',
        'ARENA_EXTRAS_NOT_FOUND',
        HttpStatus.BAD_REQUEST,
      );
    }
    return extras;
  }
}
