import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../entity/invoice.entity.js';

@Injectable()
export class InvoiceRepository {
  constructor(
    @InjectRepository(Invoice)
    private readonly repo: Repository<Invoice>,
  ) {}

  findAll(): Promise<Invoice[]> {
    return this.repo.find({
      relations: ['tableSession', 'payments'],
      order: { issuedAt: 'DESC' },
    });
  }

  findById(id: string): Promise<Invoice | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['tableSession', 'payments'],
    });
  }

  findByTableSession(tableSessionId: string): Promise<Invoice[]> {
    return this.repo.find({
      where: { tableSessionId },
      relations: ['payments'],
      order: { issuedAt: 'DESC' },
    });
  }

  save(invoice: Invoice): Promise<Invoice> {
    return this.repo.save(invoice);
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
