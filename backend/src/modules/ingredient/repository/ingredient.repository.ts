import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ingredient } from '../entity/ingredient.entity.js';

@Injectable()
export class IngredientRepository {
  constructor(
    @InjectRepository(Ingredient)
    private readonly repo: Repository<Ingredient>,
  ) {}

  findAll(): Promise<Ingredient[]> {
    return this.repo.find();
  }

  findById(id: number): Promise<Ingredient | null> {
    return this.repo.findOne({ where: { id } });
  }

  save(ingredient: Ingredient): Promise<Ingredient> {
    return this.repo.save(ingredient);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  getRepository(): Repository<Ingredient> {
    return this.repo;
  }
}
