import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Table } from '../entity/table.entity.js';

@Injectable()
export class TableRepository {
  constructor(
    @InjectRepository(Table)
    private readonly repo: Repository<Table>,
  ) {}

  findAll(): Promise<Table[]> {
    return this.repo.find();
  }

  findById(id: string): Promise<Table | null> {
    return this.repo.findOne({ where: { id } });
  }

  findByBranchId(branchId: string): Promise<Table[]> {
    return this.repo.find({ where: { branchId }, order: { tableCode: 'ASC' } });
  }

  findAvailableByBranch(branchId: string): Promise<Table[]> {
    return this.repo.find({
      where: { branchId, status: 'available' },
      order: { tableCode: 'ASC' },
    });
  }

  save(table: Table): Promise<Table> {
    return this.repo.save(table);
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
