import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  IsString,
  ValidateNested,
  ValidateIf,
} from 'class-validator';
import { TransactionStage } from 'src/common/interfaces/transactions/transaction-stage.interface';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ReservationExtraItemDto } from 'src/modules/reservation-extras/dto/reservation-extra-item.dto';

export class CreateReservationTransactionDto {
  @ValidateIf((dto) => !dto.extras || dto.extras.length === 0)
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount?: number;

  @ApiProperty({
    description:
      'Optional list of extra services with quantities for this reservation',
    type: [ReservationExtraItemDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({
    each: true,
    message: 'errors.validation.invalid_extras_format',
  })
  @Type(() => ReservationExtraItemDto)
  extras?: ReservationExtraItemDto[];

  @IsNotEmpty()
  @IsIn([TransactionStage.PENDING, TransactionStage.INSTANT])
  stage: TransactionStage;

  @IsOptional()
  @IsString()
  note?: string;
}
