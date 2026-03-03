import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BranchDish } from '../entity/branch-dish.entity.js';

@Injectable()
export class BranchDishRepository {
  constructor(
    @InjectRepository(BranchDish)
    private readonly repo: Repository<BranchDish>,
  ) {}

  findAll(): Promise<BranchDish[]> {
    return this.repo.find({ relations: ['branch', 'dish'] });
  }

  findById(id: string): Promise<BranchDish | null> {
    return this.repo.findOne({ where: { id }, relations: ['branch', 'dish'] });
  }

  findByBranch(branchId: string): Promise<BranchDish[]> {
    return this.repo.find({
      where: { branchId },
      relations: ['dish'],
      order: { dish: { name: 'ASC' } },
    });
  }

  findByDish(dishId: string): Promise<BranchDish[]> {
    return this.repo.find({
      where: { dishId },
      relations: ['branch'],
    });
  }

  findByBranchAndDish(branchId: string, dishId: string): Promise<BranchDish | null> {
    return this.repo.findOne({
      where: { branchId, dishId },
      relations: ['branch', 'dish'],
    });
  }

  save(branchDish: BranchDish): Promise<BranchDish> {
    return this.repo.save(branchDish);
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
