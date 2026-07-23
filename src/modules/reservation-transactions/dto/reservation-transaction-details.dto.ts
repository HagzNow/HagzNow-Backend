import { Expose, Transform, Type } from 'class-transformer';
import { UserRole } from 'src/modules/users/interfaces/userRole.interface';
import { ReservationExtraDto } from 'src/modules/reservations/dto/reservation-extra.dto';

export class ReservationTransactionActorDto {
  @Expose()
  id: string;

  @Expose()
  fName: string;

  @Expose()
  lName: string;

  @Expose()
  role: UserRole;
}

export class ReservationTransactionDetailsDto {
  @Expose()
  id: string;

  @Expose()
  @Transform(({ value }) => Number(value))
  amount: number;

  @Expose()
  type: string;

  @Expose()
  method: string;

  @Expose()
  stage: string;

  @Expose()
  note?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  @Transform(({ obj }) => {
    if (!obj.user) {
      return undefined;
    }

    return {
      id: obj.user.id,
      fName: obj.user.fName,
      lName: obj.user.lName,
      role: obj.user.role,
    };
  })
  createdBy?: ReservationTransactionActorDto;

  @Expose()
  @Type(() => ReservationExtraDto)
  extras: ReservationExtraDto[];
}
