import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource, Repository } from 'typeorm';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { Reservation } from './entities/reservation.entity';
export declare class ReservationsService {
    private readonly dataSource;
    private reservationRepository;
    private readonly eventEmitter;
    constructor(dataSource: DataSource, reservationRepository: Repository<Reservation>, eventEmitter: EventEmitter2);
    create(dto: CreateReservationDto, userId: string): Promise<Reservation>;
    findAll(): Promise<Reservation[]>;
    findOne(id: string): string;
    update(id: string, updateReservationDto: UpdateReservationDto): string;
    remove(id: string): string;
}
