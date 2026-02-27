import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recipe } from '../entity/recipe.entity.js';

@Injectable()
export class RecipeRepository {
  constructor(
    @InjectRepository(Recipe)
    private readonly repo: Repository<Recipe>,
  ) {}

  findAll(): Promise<Recipe[]> {
    return this.repo.find({ relations: ['dish', 'items', 'items.ingredient'] });
  }

  findById(id: number): Promise<Recipe | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['dish', 'items', 'items.ingredient'],
    });
  }

  findActiveByDishId(dishId: number): Promise<Recipe | null> {
    return this.repo.findOne({
      where: { dishId, isActive: true },
      relations: ['dish', 'items', 'items.ingredient'],
    });
  }

  findAllByDishId(dishId: number): Promise<Recipe[]> {
    return this.repo.find({
      where: { dishId },
      relations: ['dish', 'items', 'items.ingredient'],
      order: { version: 'DESC' },
    });
  }

  save(recipe: Recipe): Promise<Recipe> {
    return this.repo.save(recipe);
  }

  getRepository(): Repository<Recipe> {
    return this.repo;
  }
}
