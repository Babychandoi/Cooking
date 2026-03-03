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

  async findPaginated(
    page: number,
    limit: number,
    search?: string,
  ): Promise<[Recipe[], number]> {
    const qb = this.repo
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.dish', 'dish')
      .leftJoinAndSelect('recipe.items', 'items')
      .leftJoinAndSelect('items.ingredient', 'ingredient');

    if (search) {
      qb.where('dish.name ILIKE :search', { search: `%${search}%` });
    }

    qb.orderBy('recipe.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return qb.getManyAndCount();
  }

  findById(id: string): Promise<Recipe | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['dish', 'items', 'items.ingredient'],
    });
  }

  findActiveByDishId(dishId: string): Promise<Recipe | null> {
    return this.repo.findOne({
      where: { dishId, isActive: true },
      relations: ['dish', 'items', 'items.ingredient'],
    });
  }

  findAllByDishId(dishId: string): Promise<Recipe[]> {
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
