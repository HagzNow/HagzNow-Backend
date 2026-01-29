import { Injectable } from '@nestjs/common';
import { CustomerProfile } from './entities/customer-profile.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { ApiResponseUtil } from 'src/common/utils/api-response.util';

@Injectable()
export class CustomersService {
  /**
   *
   */
  constructor(
    @InjectRepository(CustomerProfile)
    protected customersRepository: Repository<CustomerProfile>,
  ) {}

  async create(customerDto: CreateCustomerDto) {
    const newCustomer = this.customersRepository.create(customerDto);
    await this.customersRepository.save(newCustomer);
    return newCustomer;
  }

  async findOneById(id: string) {
    const customer = await this.customersRepository.findOne({
      where: {
        id,
      },
    });
    if (!customer) {
      return ApiResponseUtil.throwError(
        'Customer not found',
        'CUSTOMER_NOT_FOUND',
        404,
      );
    }
    return customer;
  }

  async findOneByPhoneNumber(phoneNumber: string) {
    const customer = await this.customersRepository.findOne({
      where: {
        phoneNumber,
      },
    });
  }
  async findOneByPhoneNumberAndCreate(customerDto: CreateCustomerDto) {
    let customer = await this.customersRepository.findOne({
      where: {
        phoneNumber: customerDto.phoneNumber,
      },
    });
    if (!customer) {
      const newCustomer = this.customersRepository.create(customerDto);
      customer = await this.customersRepository.save(newCustomer);
    }
    return customer;
  }
}
