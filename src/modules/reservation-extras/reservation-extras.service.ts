import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, IsNull, In } from 'typeorm';
import { ReservationExtra } from '../reservations/entities/reservation-extra.entity';
import { Reservation } from '../reservations/entities/reservation.entity';
import { ApiResponseUtil } from 'src/common/utils/api-response.util';
import { ArenaExtraWithQuantity } from 'src/modules/arenas/types/arena-extra-with-quantity.type';

@Injectable()
export class ReservationExtrasService {
  constructor(
    @InjectRepository(ReservationExtra)
    private readonly reservationExtraRepository: Repository<ReservationExtra>,
  ) {}

  /**
   * Create reservation extras from arena extras with quantity
   * Converts ArenaExtra + quantity to ReservationExtra[] with pricing snapshot
   */
  async createExtras(
    reservation: Reservation,
    arenaExtras: ArenaExtraWithQuantity[],
    manager?: EntityManager,
  ): Promise<ReservationExtra[] | never> {
    const repo = manager
      ? manager.getRepository(ReservationExtra)
      : this.reservationExtraRepository;

    if (!arenaExtras || arenaExtras.length === 0) {
      return [];
    }

    const reservationExtras = arenaExtras.map(({ quantity, ...extra }) =>
      repo.create({
        reservation,
        extra,
        quantity: quantity,
        priceAtReservation: Number(extra.price),
        cancelledAt: null,
      }),
    );

    return await repo.save(reservationExtras);
  }

  /**
   * Find extras for a specific reservation
   */
  async findByReservation(
    reservationId: string,
    manager?: EntityManager,
  ): Promise<ReservationExtra[] | never> {
    const repo = manager
      ? manager.getRepository(ReservationExtra)
      : this.reservationExtraRepository;

    return await repo.find({
      where: { reservation: { id: reservationId } },
      relations: ['extra'],
    });
  }

  /**
   * Cancel a specific extra in a reservation
   */
  async cancelExtra(
    extraId: string,
    manager?: EntityManager,
  ): Promise<ReservationExtra | never> {
    const repo = manager
      ? manager.getRepository(ReservationExtra)
      : this.reservationExtraRepository;

    const extra = await repo.findOne({ where: { id: extraId } });
    if (!extra) {
      throw ApiResponseUtil.throwError(
        'errors.arena.extra_not_found',
        'EXTRA_NOT_FOUND',
        HttpStatus.NOT_FOUND,
      );
    }

    extra.cancelledAt = new Date();
    return await repo.save(extra);
  }

  /**
   * Cancel all extras for a reservation
   */
  async cancelAllExtras(
    reservationId: string,
    manager?: EntityManager,
  ): Promise<void | never> {
    const repo = manager
      ? manager.getRepository(ReservationExtra)
      : this.reservationExtraRepository;

    await repo.update(
      { reservation: { id: reservationId }, cancelledAt: IsNull() },
      { cancelledAt: new Date() },
    );
  }

  /**
   * Remove all extras for a reservation
   */
  async removeAllExtras(
    reservationId: string,
    manager?: EntityManager,
  ): Promise<void | never> {
    const repo = manager
      ? manager.getRepository(ReservationExtra)
      : this.reservationExtraRepository;

    await repo.delete({ reservation: { id: reservationId } });
  }

  /**
   * Get active (non-cancelled) extras for a reservation
   */
  async getActiveExtras(
    reservationId: string,
    manager?: EntityManager,
  ): Promise<ReservationExtra[] | never> {
    const repo = manager
      ? manager.getRepository(ReservationExtra)
      : this.reservationExtraRepository;

    return await repo.find({
      where: { reservation: { id: reservationId }, cancelledAt: IsNull() },
      relations: ['extra'],
    });
  }
}
