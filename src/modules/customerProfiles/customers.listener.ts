import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { User } from 'src/modules/users/entities/user.entity';
import { CustomersService } from './customers.service';
import { PHONE_NUMBER_UPDATED, USER_CREATED } from 'src/common/event.constants';
import { UserRole } from '../users/interfaces/userRole.interface';

@Injectable()
export class CustomersListener {
  constructor(private readonly customersService: CustomersService) {}

  // 👂 This listens to the "user.created" event
  @OnEvent(USER_CREATED)
  async handleUserCreated(user: User) {
    // Only create or update customer profile if the created user is a regular user, not an owner or admin
    if (user.role == UserRole.USER) {
      const customer = await this.customersService.findOneByPhoneNumber(
        user.phone,
      );
      if (!customer) {
        return await this.customersService.create({
          fName: user.fName,
          lName: user.lName,
          phone: user.phone,
          userId: user.id,
        });
      }
      await this.customersService.update(customer.id, {
        userId: user.id,
        fName: user.fName,
        lName: user.lName,
      });
    }
  }

  @OnEvent(PHONE_NUMBER_UPDATED)
  async handlePhoneNumberUpdated(payload: {
    oldPhone: string;
    newPhone: string;
  }) {
    const customer = await this.customersService.findOneByPhoneNumber(
      payload.oldPhone,
    );
    if (customer) {
      await this.customersService.updatePhone(customer.id, payload.newPhone);
    }
  }
}
