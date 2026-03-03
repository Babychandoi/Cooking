import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentService } from './payment.service.js';
import { PaymentRepository } from '../repository/payment.repository.js';
import { PaymentMapper } from '../mapper/payment.mapper.js';
import { PaymentResponseDto } from '../dto/response/payment-response.dto.js';
import { CreatePaymentDto } from '../dto/request/create-payment.dto.js';
import { Payment } from '../entity/payment.entity.js';

@Injectable()
export class PaymentServiceImpl implements PaymentService {
  constructor(private readonly repository: PaymentRepository) {}

  async findAll(): Promise<PaymentResponseDto[]> {
    const payments = await this.repository.findAll();
    return PaymentMapper.toDtoList(payments);
  }

  async findById(id: string): Promise<PaymentResponseDto> {
    const payment = await this.repository.findById(id);
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return PaymentMapper.toDto(payment);
  }

  async findByInvoice(invoiceId: string): Promise<PaymentResponseDto[]> {
    const payments = await this.repository.findByInvoice(invoiceId);
    return PaymentMapper.toDtoList(payments);
  }

  async create(dto: CreatePaymentDto): Promise<PaymentResponseDto> {
    const payment = new Payment();
    payment.invoiceId = dto.invoiceId;
    payment.method = dto.method;
    payment.amount = dto.amount;

    const saved = await this.repository.save(payment);
    const loaded = await this.repository.findById(saved.id);
    return PaymentMapper.toDto(loaded!);
  }

  async delete(id: string): Promise<void> {
    const payment = await this.repository.findById(id);
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    await this.repository.remove(id);
  }
}
