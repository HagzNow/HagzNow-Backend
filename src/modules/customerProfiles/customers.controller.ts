import { Controller, Get, Param } from '@nestjs/common';
import { CustomersService } from './customers.service';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get(':phone')
  findOne(@Param('phone') phone: string) {
    return this.customersService.findOneByPhoneNumber(phone);
  }
}
