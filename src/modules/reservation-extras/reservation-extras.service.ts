import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, IsNull, In, Not } from 'typeorm';
import { ReservationExtra } from '../reservations/entities/reservation-extra.entity';
import { Reservation } from '../reservations/entities/reservation.entity';
import { ReservationTransaction } from '../reservation-transactions/entities/reservation-transaction.entity';
import { ApiResponseUtil } from 'src/common/utils/api-response.util';
import { ArenaExtraWithQuantity } from 'src/modules/arenas/types/arena-extra-with-quantity.type';
import { ArenaExtrasService } from '../arena-extras/arena-extras.service';
import { TransactionStage } from 'src/common/interfaces/transactions/transaction-stage.interface';

@Injectable()
export class ReservationExtrasService {
  constructor(
    @InjectRepository(ReservationExtra)
    private readonly reservationExtraRepository: Repository<ReservationExtra>,
    private readonly arenaExtrasService: ArenaExtrasService,
  ) {}

  async prepareExtrasForTransaction(
    arenaId: string,
    inputExtras: { extraId: string; quantity: number }[],
    manager: EntityManager,
  ): Promise<ArenaExtraWithQuantity[]> {
    // 1. Fetch matching entities
    const arenaExtras = await this.arenaExtrasService.findArenaExtrasByIds(
      arenaId,
      inputExtras.map((e) => e.extraId),
      manager,
    );

    // 2. Create a map for quick lookup that contains the actual ArenaExtra entities
    const arenaExtraMap = new Map(arenaExtras.map((e) => [e.id, e]));

    // 2. Map structural quantities cleanly
    return inputExtras.map((item) => {
      const extraEntity = arenaExtraMap.get(item.extraId);
      if (!extraEntity) {
        throw ApiResponseUtil.throwError(
          'errors.arena_extra.not_found',
          'ARENA_EXTRA_NOT_FOUND',
          404,
        );
      }

      return {
        ...(extraEntity as any),
        quantity: item.quantity,
      };
    });
  }

  /**
   * Create reservation extras from arena extras with quantity
   * Converts ArenaExtra + quantity to ReservationExtra[] with pricing snapshot
   */
  /**
   * Create reservation extras strictly bound to a transaction.
   * Notice how we removed the unused 'reservation' param to clean up the overloaded sign.
   */
  async createExtras(
    transaction: ReservationTransaction,
    arenaExtras: ArenaExtraWithQuantity[],
    manager?: EntityManager,
  ): Promise<ReservationExtra[]> {
    const repo = manager
      ? manager.getRepository(ReservationExtra)
      : this.reservationExtraRepository;

    if (!arenaExtras || arenaExtras.length === 0) {
      return [];
    }

    const reservationExtras = arenaExtras.map(({ quantity, ...extra }) =>
      repo.create({
        extra,
        transaction,
        quantity,
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
      where: { transaction: { reservation: { id: reservationId } } },
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
      {
        transaction: { reservation: { id: reservationId } },
        cancelledAt: IsNull(),
      },
      { cancelledAt: new Date() },
    );
  }

  /**
   * Cancel all extras for an array of transactions
   */
  async cancelExtrasForTransactions(
    transactionIds: string[],
    manager?: EntityManager,
  ): Promise<void | never> {
    const repo = manager
      ? manager.getRepository(ReservationExtra)
      : this.reservationExtraRepository;

    await repo.update(
      {
        transaction: { id: In(transactionIds) },
        cancelledAt: IsNull(),
      },
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

    await repo.delete({ transaction: { reservation: { id: reservationId } } });
  }

  /**
   * Get active (non-cancelled) extras for a reservation
   */
  async getActiveExtrasForReservation(
    reservationId: string,
    manager?: EntityManager,
  ): Promise<ReservationExtra[] | never> {
    const repo = manager
      ? manager.getRepository(ReservationExtra)
      : this.reservationExtraRepository;

    return await repo.find({
      where: {
        transaction: {
          reservation: { id: reservationId },
          stage: Not(TransactionStage.CANCELED),
        },
        cancelledAt: IsNull(),
      },
      relations: ['extra'],
    });
  }
}
