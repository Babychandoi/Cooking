import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../entity/payment.entity.js';

@Injectable()
export class PaymentRepository {
  constructor(
    @InjectRepository(Payment)
    private readonly repo: Repository<Payment>,
  ) {}

  findAll(): Promise<Payment[]> {
    return this.repo.find({
      relations: ['invoice'],
      order: { paidAt: 'DESC' },
    });
  }

  findById(id: string): Promise<Payment | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['invoice'],
    });
  }

  findByInvoice(invoiceId: string): Promise<Payment[]> {
    return this.repo.find({
      where: { invoiceId },
      order: { paidAt: 'DESC' },
    });
  }

  save(payment: Payment): Promise<Payment> {
    return this.repo.save(payment);
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
