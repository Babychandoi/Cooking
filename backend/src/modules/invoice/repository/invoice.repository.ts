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

  async findAllPaginated(page: number, limit: number, search: string): Promise<[Invoice[], number]> {
    const query = this.repo
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.tableSession', 'tableSession')
      .leftJoinAndSelect('invoice.payments', 'payments')
      .orderBy('invoice.issuedAt', 'DESC');

    if (search) {
      query.where('invoice.status ILIKE :search OR invoice.id::text ILIKE :search', {
        search: `%${search}%`,
      });
    }

    query.skip((page - 1) * limit).take(limit);

    return query.getManyAndCount();
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
