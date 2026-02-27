import { Injectable } from '@nestjs/common';
import { IngredientRepository } from '../../ingredient/repository/ingredient.repository.js';
import { RecipeRepository } from '../../recipe/repository/recipe.repository.js';
import {
  InsufficientItem,
  InsufficientStockException,
} from '../../../common/exception/exceptions/insufficient-stock.exception.js';

export interface StockCheckItem {
  dishId: number;
  quantity: number;
}

@Injectable()
export class StockCheckerService {
  constructor(
    private readonly ingredientRepository: IngredientRepository,
    private readonly recipeRepository: RecipeRepository,
  ) {}

  /**
   * Check if sufficient stock exists for the given order items.
   * Returns the ingredient requirements per dish if all stock is available.
   * Throws InsufficientStockException if any ingredient is lacking.
   */
  async checkStock(
    items: StockCheckItem[],
  ): Promise<Map<number, { ingredientId: number; quantity: number; unit: string }[]>> {
    // Aggregate required quantities per ingredient
    const requiredMap = new Map<number, { name: string; required: number; available: number }>();
    const dishIngredients = new Map<number, { ingredientId: number; quantity: number; unit: string }[]>();

    for (const item of items) {
      const recipe = await this.recipeRepository.findActiveByDishId(item.dishId);
      if (!recipe) {
        throw new Error(`No active recipe found for dish ${item.dishId}`);
      }

      const ingredientsForDish: { ingredientId: number; quantity: number; unit: string }[] = [];

      for (const recipeItem of recipe.items) {
        const totalRequired = Number(recipeItem.quantity) * item.quantity;

        ingredientsForDish.push({
          ingredientId: recipeItem.ingredientId,
          quantity: totalRequired,
          unit: recipeItem.unit,
        });

        const existing = requiredMap.get(recipeItem.ingredientId);
        if (existing) {
          existing.required += totalRequired;
        } else {
          const ingredient = await this.ingredientRepository.findById(recipeItem.ingredientId);
          requiredMap.set(recipeItem.ingredientId, {
            name: ingredient?.name || `Ingredient #${recipeItem.ingredientId}`,
            required: totalRequired,
            available: Number(ingredient?.stock || 0),
          });
        }
      }

      dishIngredients.set(item.dishId, ingredientsForDish);
    }

    // Check for insufficient stock
    const insufficientItems: InsufficientItem[] = [];
    for (const [, value] of requiredMap) {
      if (value.available < value.required) {
        insufficientItems.push({
          name: value.name,
          required: value.required,
          available: value.available,
          shortage: value.required - value.available,
        });
      }
    }

    if (insufficientItems.length > 0) {
      throw new InsufficientStockException(insufficientItems);
    }

    return dishIngredients;
  }
}
