"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationsService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const typeorm_1 = require("@nestjs/typeorm");
const api_response_util_1 = require("../../common/utils/api-response.util");
const typeorm_2 = require("typeorm");
const arena_extra_entity_1 = require("../arenas/entities/arena-extra.entity");
const arena_slot_entity_1 = require("../arenas/entities/arena-slot.entity");
const arena_entity_1 = require("../arenas/entities/arena.entity");
const user_entity_1 = require("../users/entities/user.entity");
const wallet_transaction_entity_1 = require("../wallets/entities/wallet-transaction.entity");
const transaction_stage_interface_1 = require("../wallets/interfaces/transaction-stage.interface");
const transaction_type_interface_1 = require("../wallets/interfaces/transaction-type.interface");
const reservation_entity_1 = require("./entities/reservation.entity");
const reservation_status_interface_1 = require("./interfaces/reservation-status.interface");
let ReservationsService = class ReservationsService {
    dataSource;
    reservationRepository;
    eventEmitter;
    constructor(dataSource, reservationRepository, eventEmitter) {
        this.dataSource = dataSource;
        this.reservationRepository = reservationRepository;
        this.eventEmitter = eventEmitter;
    }
    async create(dto, userId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const user = await queryRunner.manager.findOne(user_entity_1.User, {
                where: { id: userId },
                relations: ['wallet'],
            });
            if (!user) {
                return api_response_util_1.ApiResponseUtil.throwError('User not found', 'USER_NOT_FOUND', common_1.HttpStatus.NOT_FOUND);
            }
            const arena = await queryRunner.manager.findOne(arena_entity_1.Arena, {
                where: { id: dto.arenaId },
            });
            if (!arena) {
                return api_response_util_1.ApiResponseUtil.throwError('Arena not found', 'ARENA_NOT_FOUND', common_1.HttpStatus.NOT_FOUND);
            }
            const extras = await queryRunner.manager.findByIds(arena_extra_entity_1.ArenaExtra, dto.extras || []);
            const playAmount = arena.getDepositAmount(dto.slots.length);
            const extrasAmount = extras.reduce((sum, extra) => sum + Number(extra.price), 0);
            const totalAmount = playAmount + extrasAmount;
            if (!user.wallet || user.wallet.balance < totalAmount) {
                return api_response_util_1.ApiResponseUtil.throwError('Insufficient wallet balance', 'INSUFFICIENT_BALANCE', common_1.HttpStatus.BAD_REQUEST);
            }
            const existingSlots = await queryRunner.manager.find(arena_slot_entity_1.ArenaSlot, {
                where: {
                    arena: { id: dto.arenaId },
                    date: dto.date,
                    hour: (0, typeorm_2.In)(dto.slots),
                },
            });
            if (existingSlots.length > 0) {
                const bookedHours = existingSlots.map((s) => s.hour);
                return api_response_util_1.ApiResponseUtil.throwError(`Some slots are already booked for this arena: ${bookedHours.join(', ')}`, 'SLOTS_ALREADY_BOOKED', common_1.HttpStatus.BAD_REQUEST);
            }
            const reservation = queryRunner.manager.create(reservation_entity_1.Reservation, {
                user,
                status: reservation_status_interface_1.ReservationStatus.HOLD,
                dateOfReservation: dto.date,
                totalAmount: totalAmount,
                playTotalAmount: playAmount,
                extrasTotalAmount: extrasAmount,
                arena: arena,
            });
            await queryRunner.manager.save(reservation);
            for (const hour of dto.slots) {
                const slot = queryRunner.manager.create(arena_slot_entity_1.ArenaSlot, {
                    arena,
                    reservation,
                    date: dto.date,
                    hour,
                });
                await queryRunner.manager.save(slot);
            }
            const walletTx = queryRunner.manager.create(wallet_transaction_entity_1.WalletTransaction, {
                wallet: user.wallet,
                amount: totalAmount,
                type: transaction_type_interface_1.TransactionType.PAYMENT,
                stage: transaction_stage_interface_1.TransactionStage.HOLD,
                referenceId: reservation.id,
            });
            user.wallet.balance -= totalAmount;
            await queryRunner.manager.save([walletTx, user.wallet]);
            await queryRunner.commitTransaction();
            this.eventEmitter.emit('reservation.created', reservation);
            return reservation;
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async findAll() {
        return await this.reservationRepository.find();
    }
    findOne(id) {
        return `This action returns a #${id} reservation`;
    }
    update(id, updateReservationDto) {
        return `This action updates a #${id} reservation`;
    }
    remove(id) {
        return `This action removes a #${id} reservation`;
    }
};
exports.ReservationsService = ReservationsService;
exports.ReservationsService = ReservationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(reservation_entity_1.Reservation)),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        typeorm_2.Repository,
        event_emitter_1.EventEmitter2])
], ReservationsService);
//# sourceMappingURL=reservations.service.js.map