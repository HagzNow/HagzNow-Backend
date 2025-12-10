import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/interfaces/userRole.interface';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewSummaryDto } from './dto/review-summary.dto';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Serialize(ReviewSummaryDto)
  @Roles(UserRole.USER)
  @Post()
  async create(@Body() dto: CreateReviewDto, @CurrentUser() currentUser: User) {
    return this.reviewsService.create(dto, currentUser);
  }

  @Serialize(ReviewSummaryDto)
  @Get('arena/:arenaId')
  async findByArena(
    @Param('arenaId') arenaId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    if (!arenaId) {
      throw new Error('Arena ID is required');
    }
    return this.reviewsService.findByArena(arenaId, paginationDto);
  }
}
