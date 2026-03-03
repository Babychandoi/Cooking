import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecipeItem } from '../entity/recipe-item.entity.js';

@Injectable()
export class RecipeItemRepository {
  constructor(
    @InjectRepository(RecipeItem)
    private readonly repo: Repository<RecipeItem>,
  ) {}

  findByRecipeId(recipeId: string): Promise<RecipeItem[]> {
    return this.repo.find({
      where: { recipeId },
      relations: ['ingredient'],
    });
  }

  save(item: RecipeItem): Promise<RecipeItem> {
    return this.repo.save(item);
  }

  saveMany(items: RecipeItem[]): Promise<RecipeItem[]> {
    return this.repo.save(items);
  }

  async removeByRecipeId(recipeId: string): Promise<void> {
    await this.repo.delete({ recipeId });
  }

  async remove(item: RecipeItem): Promise<void> {
    await this.repo.remove(item);
  }
}
