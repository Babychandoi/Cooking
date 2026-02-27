import { Injectable } from '@nestjs/common';
import { RecipeService } from './recipe.service.js';
import { RecipeRepository } from '../repository/recipe.repository.js';
import { RecipeItemRepository } from '../repository/recipe-item.repository.js';
import { CreateRecipeDto } from '../dto/request/create-recipe.dto.js';
import { UpdateRecipeDto } from '../dto/request/update-recipe.dto.js';
import { RecipeResponseDto } from '../dto/response/recipe-response.dto.js';
import { RecipeMapper } from '../mapper/recipe.mapper.js';
import { Recipe } from '../entity/recipe.entity.js';
import { RecipeItem } from '../entity/recipe-item.entity.js';
import { DishRepository } from '../../dish/repository/dish.repository.js';
import { IngredientRepository } from '../../ingredient/repository/ingredient.repository.js';
import { EntityNotFoundException } from '../../../common/exception/exceptions/not-found.exception.js';
import { PaginatedResponse } from '../../../common/response/paginated-response.js';

@Injectable()
export class RecipeServiceImpl implements RecipeService {
  constructor(
    private readonly recipeRepository: RecipeRepository,
    private readonly recipeItemRepository: RecipeItemRepository,
    private readonly dishRepository: DishRepository,
    private readonly ingredientRepository: IngredientRepository,
  ) {}

  async findAll(): Promise<RecipeResponseDto[]> {
    const recipes = await this.recipeRepository.findAll();
    return RecipeMapper.toResponseList(recipes);
  }

  async findPaginated(
    page: number,
    limit: number,
    search?: string,
  ): Promise<PaginatedResponse<RecipeResponseDto>> {
    const [items, total] = await this.recipeRepository.findPaginated(page, limit, search);
    const dtos = RecipeMapper.toResponseList(items);
    return new PaginatedResponse(dtos, total, page, limit);
  }

  async findById(id: number): Promise<RecipeResponseDto> {
    const recipe = await this.recipeRepository.findById(id);
    if (!recipe) {
      throw new EntityNotFoundException('Recipe', id);
    }
    return RecipeMapper.toResponse(recipe);
  }

  async findActiveByDishId(dishId: number): Promise<RecipeResponseDto> {
    const recipe = await this.recipeRepository.findActiveByDishId(dishId);
    if (!recipe) {
      throw new EntityNotFoundException('Active Recipe for Dish', dishId);
    }
    return RecipeMapper.toResponse(recipe);
  }

  async create(dto: CreateRecipeDto): Promise<RecipeResponseDto> {
    // Validate dish exists
    const dish = await this.dishRepository.findById(dto.dishId);
    if (!dish) {
      throw new EntityNotFoundException('Dish', dto.dishId);
    }

    // Validate all ingredients exist
    for (const item of dto.items) {
      const ingredient = await this.ingredientRepository.findById(
        item.ingredientId,
      );
      if (!ingredient) {
        throw new EntityNotFoundException('Ingredient', item.ingredientId);
      }
    }

    // Deactivate existing active recipe for this dish
    const existingActive =
      await this.recipeRepository.findActiveByDishId(dto.dishId);
    let newVersion = 1;
    if (existingActive) {
      existingActive.isActive = false;
      await this.recipeRepository.save(existingActive);
      newVersion = existingActive.version + 1;
    }

    // Create new recipe
    const recipe = new Recipe();
    recipe.dishId = dto.dishId;
    recipe.version = newVersion;
    recipe.isActive = true;
    recipe.items = dto.items.map((itemDto) => {
      const item = new RecipeItem();
      item.ingredientId = itemDto.ingredientId;
      item.quantity = itemDto.quantity;
      item.unit = itemDto.unit;
      return item;
    });

    const saved = await this.recipeRepository.save(recipe);
    const full = await this.recipeRepository.findById(saved.id);
    return RecipeMapper.toResponse(full!);
  }

  async update(
    id: number,
    dto: UpdateRecipeDto,
  ): Promise<RecipeResponseDto> {
    // Validate existing recipe
    const existing = await this.recipeRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundException('Recipe', id);
    }

    // Validate dish exists
    const dish = await this.dishRepository.findById(dto.dishId);
    if (!dish) {
      throw new EntityNotFoundException('Dish', dto.dishId);
    }

    // Validate all ingredients exist
    for (const item of dto.items) {
      const ingredient = await this.ingredientRepository.findById(
        item.ingredientId,
      );
      if (!ingredient) {
        throw new EntityNotFoundException('Ingredient', item.ingredientId);
      }
    }

    // Build a map of incoming items by ingredientId
    const incomingMap = new Map(
      dto.items.map((it) => [it.ingredientId, it]),
    );

    // Determine items to remove (exist in DB but not in incoming)
    const existingItems = existing.items || [];
    const toRemove = existingItems.filter(
      (ei) => !incomingMap.has(ei.ingredientId),
    );

    // Remove deleted items
    for (const item of toRemove) {
      await this.recipeItemRepository.remove(item);
    }

    // Build map of existing items by ingredientId for updates
    const existingMap = new Map(
      existingItems.map((ei) => [ei.ingredientId, ei]),
    );

    // Update existing items or add new ones
    for (const itemDto of dto.items) {
      const existingItem = existingMap.get(itemDto.ingredientId);
      if (existingItem) {
        // Update quantity/unit if changed
        existingItem.quantity = itemDto.quantity;
        existingItem.unit = itemDto.unit;
        await this.recipeItemRepository.save(existingItem);
      } else {
        // Add new item
        const newItem = new RecipeItem();
        newItem.recipeId = id;
        newItem.ingredientId = itemDto.ingredientId;
        newItem.quantity = itemDto.quantity;
        newItem.unit = itemDto.unit;
        await this.recipeItemRepository.save(newItem);
      }
    }

    const full = await this.recipeRepository.findById(id);
    return RecipeMapper.toResponse(full!);
  }

  async activate(id: number): Promise<RecipeResponseDto> {
    const recipe = await this.recipeRepository.findById(id);
    if (!recipe) {
      throw new EntityNotFoundException('Recipe', id);
    }

    if (recipe.isActive) {
      return RecipeMapper.toResponse(recipe);
    }

    // Deactivate current active recipe for the same dish
    const currentActive = await this.recipeRepository.findActiveByDishId(recipe.dishId);
    if (currentActive) {
      currentActive.isActive = false;
      await this.recipeRepository.save(currentActive);
    }

    // Activate selected recipe
    recipe.isActive = true;
    await this.recipeRepository.save(recipe);

    const full = await this.recipeRepository.findById(id);
    return RecipeMapper.toResponse(full!);
  }
}
