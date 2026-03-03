import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TableSession } from '../entity/table-session.entity.js';

@Injectable()
export class TableSessionRepository {
  constructor(
    @InjectRepository(TableSession)
    private readonly repo: Repository<TableSession>,
  ) {}

  findAll(): Promise<TableSession[]> {
    return this.repo.find({
      relations: ['table', 'orders'],
      order: { openedAt: 'DESC' },
    });
  }

  findById(id: string): Promise<TableSession | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['table', 'orders', 'orders.items'],
    });
  }

  findActiveByTable(tableId: string): Promise<TableSession | null> {
    return this.repo.findOne({
      where: { tableId, status: 'open' },
      relations: ['table', 'orders'],
    });
  }

  findByTable(tableId: string): Promise<TableSession[]> {
    return this.repo.find({
      where: { tableId },
      relations: ['table', 'orders'],
      order: { openedAt: 'DESC' },
    });
  }

  save(session: TableSession): Promise<TableSession> {
    return this.repo.save(session);
  }

  async calculateTotal(sessionId: string): Promise<number> {
    const result = await this.repo
      .createQueryBuilder('session')
      .leftJoin('session.orders', 'order')
      .leftJoin('order.items', 'item')
      .select('SUM(item.unitPrice * item.quantity)', 'total')
      .where('session.id = :sessionId', { sessionId })
      .getRawOne();

    return Number(result?.total || 0);
  }
}
