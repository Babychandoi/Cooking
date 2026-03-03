import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BranchIngredient } from '../entity/branch-ingredient.entity.js';

@Injectable()
export class BranchIngredientRepository {
  constructor(
    @InjectRepository(BranchIngredient)
    private readonly repo: Repository<BranchIngredient>,
  ) {}

  findAll(): Promise<BranchIngredient[]> {
    return this.repo.find({ relations: ['branch', 'ingredient'] });
  }

  findById(id: string): Promise<BranchIngredient | null> {
    return this.repo.findOne({ where: { id }, relations: ['branch', 'ingredient'] });
  }

  findByBranch(branchId: string): Promise<BranchIngredient[]> {
    return this.repo.find({
      where: { branchId },
      relations: ['ingredient'],
      order: { ingredient: { name: 'ASC' } },
    });
  }

  findByIngredient(ingredientId: string): Promise<BranchIngredient[]> {
    return this.repo.find({
      where: { ingredientId },
      relations: ['branch'],
    });
  }

  findByBranchAndIngredient(branchId: string, ingredientId: string): Promise<BranchIngredient | null> {
    return this.repo.findOne({
      where: { branchId, ingredientId },
      relations: ['branch', 'ingredient'],
    });
  }

  save(branchIngredient: BranchIngredient): Promise<BranchIngredient> {
    return this.repo.save(branchIngredient);
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
