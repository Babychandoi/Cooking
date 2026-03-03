import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from '../entity/branch.entity.js';

@Injectable()
export class BranchRepository {
  constructor(
    @InjectRepository(Branch)
    private readonly repo: Repository<Branch>,
  ) {}

  findAll(): Promise<Branch[]> {
    return this.repo.find({ where: { status: 'active' } });
  }

  findById(id: string): Promise<Branch | null> {
    return this.repo.findOne({ where: { id } });
  }

  findByChainId(chainId: string): Promise<Branch[]> {
    return this.repo.find({ where: { chainId, status: 'active' } });
  }

  save(branch: Branch): Promise<Branch> {
    return this.repo.save(branch);
  }

  async remove(id: string): Promise<void> {
    await this.repo.update(id, { status: 'closed' });
  }
}
