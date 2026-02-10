import { Injectable } from '@nestjs/common';
import { CustomerProfile } from './entities/customer-profile.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { ApiResponseUtil } from 'src/common/utils/api-response.util';
import { plainToInstance } from 'class-transformer';
import { CustomerResponseDto } from './dto/customer-reponse.dto';

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
    const duplicatePhoneCustomer = await this.customersRepository.findOne({
      where: {
        phone: customerDto.phone,
      },
    });
    if (duplicatePhoneCustomer) {
      return ApiResponseUtil.throwError(
        'errors.customer.phone_already_exists',
        'DUPLICATE_PHONE_NUMBER',
        400,
      );
    }
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
        'errors.customer.not_found',
        'CUSTOMER_NOT_FOUND',
        404,
      );
    }
    return customer;
  }

  async findOneByPhoneNumber(phone: string) {
    const customer = await this.customersRepository.findOne({
      where: {
        phone,
      },
    });
    return plainToInstance(CustomerResponseDto, customer, {
      excludeExtraneousValues: true,
    });
  }
  async findOneByPhoneNumberAndCreate(customerDto: CreateCustomerDto) {
    let customer = await this.customersRepository.findOne({
      where: {
        phone: customerDto.phone,
      },
    });
    if (!customer) {
      const newCustomer = this.customersRepository.create(customerDto);
      customer = await this.customersRepository.save(newCustomer);
    }
    return customer;
  }

  async update(
    id: string,
    updateCustomerDto: {
      fName?: string;
      lName?: string;
      userId?: string;
    },
  ) {
    const customer = await this.findOneById(id);
    const updatedCustomer = this.customersRepository.update(customer.id, {
      ...customer,
      ...updateCustomerDto,
    });
    return updatedCustomer;
  }

  async updatePhone(id: string, phone: string) {
    const customer = await this.findOneById(id);
    const updatedCustomer = this.customersRepository.update(customer.id, {
      ...customer,
      phone,
    });
    return updatedCustomer;
  }
}
