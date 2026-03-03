import { Injectable, NotFoundException } from '@nestjs/common';
import { IngredientService } from './ingredient.service.js';
import { IngredientRepository } from '../repository/ingredient.repository.js';
import { IngredientMapper } from '../mapper/ingredient.mapper.js';
import { CreateIngredientDto } from '../dto/request/create-ingredient.dto.js';
import { UpdateIngredientDto } from '../dto/request/update-ingredient.dto.js';
import { IngredientResponseDto } from '../dto/response/ingredient-response.dto.js';
import { Ingredient } from '../entity/ingredient.entity.js';
import { PaginatedResponse } from '../../../common/response/paginated-response.js';

@Injectable()
export class IngredientServiceImpl implements IngredientService {
  constructor(
    private readonly ingredientRepository: IngredientRepository,
  ) {}

  async findAll(): Promise<IngredientResponseDto[]> {
    const ingredients = await this.ingredientRepository.findAll();
    return IngredientMapper.toResponseList(ingredients);
  }

  async findPaginated(
    page: number,
    limit: number,
    search?: string,
  ): Promise<PaginatedResponse<IngredientResponseDto>> {
    const [items, total] = await this.ingredientRepository.findPaginated(page, limit, search);
    const dtos = IngredientMapper.toResponseList(items);
    return new PaginatedResponse(dtos, total, page, limit);
  }

  async findById(id: string): Promise<IngredientResponseDto> {
    const ingredient = await this.ingredientRepository.findById(id);
    if (!ingredient) {
      throw new NotFoundException(`Ingredient with ID ${id} not found`);
    }
    return IngredientMapper.toResponse(ingredient);
  }

  async create(dto: CreateIngredientDto): Promise<IngredientResponseDto> {
    const ingredient = new Ingredient();
    ingredient.name = dto.name;
    ingredient.unit = dto.unit;
    ingredient.status = 'active';

    const saved = await this.ingredientRepository.save(ingredient);
    return IngredientMapper.toResponse(saved);
  }

  async update(
    id: string,
    dto: UpdateIngredientDto,
  ): Promise<IngredientResponseDto> {
    const ingredient = await this.ingredientRepository.findById(id);
    if (!ingredient) {
      throw new NotFoundException(`Ingredient with ID ${id} not found`);
    }

    if (dto.name !== undefined) ingredient.name = dto.name;
    if (dto.unit !== undefined) ingredient.unit = dto.unit;

    const updated = await this.ingredientRepository.save(ingredient);
    return IngredientMapper.toResponse(updated);
  }

  async restock(
    id: string,
    quantity: number,
  ): Promise<IngredientResponseDto> {
    // Note: Stock is now managed per branch via BranchIngredient
    // This method is kept for backward compatibility but does nothing
    const ingredient = await this.ingredientRepository.findById(id);
    if (!ingredient) {
      throw new NotFoundException(`Ingredient with ID ${id} not found`);
    }
    return IngredientMapper.toResponse(ingredient);
  }

  async delete(id: string): Promise<void> {
    const ingredient = await this.ingredientRepository.findById(id);
    if (!ingredient) {
      throw new NotFoundException(`Ingredient with ID ${id} not found`);
    }
    await this.ingredientRepository.remove(id);
  }
}
