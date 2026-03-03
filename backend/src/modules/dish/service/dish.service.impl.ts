import { Injectable, BadRequestException } from '@nestjs/common';
import { DishService } from './dish.service.js';
import { DishRepository } from '../repository/dish.repository.js';
import { RecipeRepository } from '../../recipe/repository/recipe.repository.js';
import { CreateDishDto } from '../dto/request/create-dish.dto.js';
import { UpdateDishDto } from '../dto/request/update-dish.dto.js';
import { DishResponseDto } from '../dto/response/dish-response.dto.js';
import { DishMapper } from '../mapper/dish.mapper.js';
import { Dish } from '../entity/dish.entity.js';
import { EntityNotFoundException } from '../../../common/exception/exceptions/not-found.exception.js';
import { PaginatedResponse } from '../../../common/response/paginated-response.js';

@Injectable()
export class DishServiceImpl implements DishService {
  constructor(
    private readonly dishRepository: DishRepository,
    private readonly recipeRepository: RecipeRepository,
  ) {}

  async findAll(): Promise<DishResponseDto[]> {
    const dishes = await this.dishRepository.findAll();
    return DishMapper.toResponseList(dishes);
  }

  async findPaginated(
    page: number,
    limit: number,
    search?: string,
  ): Promise<PaginatedResponse<DishResponseDto>> {
    const [items, total] = await this.dishRepository.findPaginated(page, limit, search);
    const dtos = DishMapper.toResponseList(items);
    return new PaginatedResponse(dtos, total, page, limit);
  }

  async findById(id: string): Promise<DishResponseDto> {
    const dish = await this.dishRepository.findById(id);
    if (!dish) {
      throw new EntityNotFoundException('Dish', id);
    }
    return DishMapper.toResponse(dish);
  }

  async create(dto: CreateDishDto): Promise<DishResponseDto> {
    const dish = new Dish();
    dish.name = dto.name;
    dish.description = dto.description || '';
    dish.imageUrl = dto.imageUrl || null;
    dish.isCombo = dto.isCombo || false;
    dish.status = 'active';

    const saved = await this.dishRepository.save(dish);
    return DishMapper.toResponse(saved);
  }

  async update(id: string, dto: UpdateDishDto): Promise<DishResponseDto> {
    const dish = await this.dishRepository.findById(id);
    if (!dish) {
      throw new EntityNotFoundException('Dish', id);
    }

    if (dto.name !== undefined) dish.name = dto.name;
    if (dto.description !== undefined) dish.description = dto.description;
    if (dto.isCombo !== undefined) dish.isCombo = dto.isCombo;
    if (dto.imageUrl !== undefined) dish.imageUrl = dto.imageUrl || null;

    const saved = await this.dishRepository.save(dish);
    return DishMapper.toResponse(saved);
  }

  async delete(id: string): Promise<void> {
    const dish = await this.dishRepository.findById(id);
    if (!dish) {
      throw new EntityNotFoundException('Dish', id);
    }
    await this.dishRepository.remove(id);
  }
}
