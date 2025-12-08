import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiResponseUtil } from 'src/common/utils/api-response.util';
import { Repository } from 'typeorm';
import { ArenasService } from '../arenas/arenas.service';
import { ReservationsService } from '../reservations/reservations.service';
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
        'Arena not found',
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
        'You can only review arenas you have reserved',
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

  async findByArena(arenaId: string) {
    return this.reviewsRepo.find({
      where: { arena: { id: arenaId } },
      order: { createdAt: 'DESC' },
    });
  }
}
