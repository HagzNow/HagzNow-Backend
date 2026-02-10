import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ApiResponseUtil } from 'src/common/utils/api-response.util';
import { paginate } from 'src/common/utils/paginate';
import { Repository } from 'typeorm';
import { ArenasService } from '../arenas/arenas.service';
import { ReservationsService } from '../reservations/services/reservations.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private readonly reviewsRepo: Repository<Review>,
    private readonly arenasService: ArenasService,
    private readonly usersService: UsersService,
    private readonly reservationsService: ReservationsService,
  ) {}

  async create(dto: CreateReviewDto, currentUser: User) {
    const arena = await this.arenasService.findOne(dto.arenaId);
    if (!arena)
      return ApiResponseUtil.throwError(
        'errors.arena.not_found',
        'ARENA_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );

    const hasReservedThisArenaBefore =
      await this.reservationsService.hasUserReservedThisArenaBefore(
        dto.arenaId,
        currentUser.id,
      );
    if (!hasReservedThisArenaBefore) {
      return ApiResponseUtil.throwError(
        'errors.review.cannot_review_unreserved_arena',
        'CANNOT_REVIEW_UNRESERVED_ARENA',
        HttpStatus.FORBIDDEN,
      );
    }

    const review = this.reviewsRepo.create({
      rating: dto.rating,
      content: dto.content,
      user: currentUser,
      arena,
    });

    return this.reviewsRepo.save(review);
  }

  async findByArena(
    arenaId: string,
    paginationDto: PaginationDto = { page: 1, limit: 10 },
  ) {
    const query = this.reviewsRepo
      .createQueryBuilder('review')
      .where('review.arenaId = :arenaId', { arenaId })
      .leftJoinAndSelect('review.user', 'user')
      .orderBy('review.createdAt', 'DESC');
    return paginate(query, paginationDto);
  }
}
