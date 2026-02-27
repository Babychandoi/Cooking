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

  async findById(id: number): Promise<DishResponseDto> {
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
    dish.price = dto.price;
    dish.isAvailable = false; // Mới tạo chưa có công thức nên không thể có sẵn

    const saved = await this.dishRepository.save(dish);
    return DishMapper.toResponse(saved);
  }

  async update(id: number, dto: UpdateDishDto): Promise<DishResponseDto> {
    const dish = await this.dishRepository.findById(id);
    if (!dish) {
      throw new EntityNotFoundException('Dish', id);
    }

    // Check if trying to set available without an active recipe
    if (dto.isAvailable === true) {
      const activeRecipe = await this.recipeRepository.findActiveByDishId(id);
      if (!activeRecipe) {
        throw new BadRequestException('Không thể đặt "Có sẵn" vì món này chưa có công thức');
      }
    }

    if (dto.name !== undefined) dish.name = dto.name;
    if (dto.description !== undefined) dish.description = dto.description;
    if (dto.price !== undefined) dish.price = dto.price;
    if (dto.isAvailable !== undefined) dish.isAvailable = dto.isAvailable;

    const saved = await this.dishRepository.save(dish);
    return DishMapper.toResponse(saved);
  }

  async delete(id: number): Promise<void> {
    const dish = await this.dishRepository.findById(id);
    if (!dish) {
      throw new EntityNotFoundException('Dish', id);
    }
    await this.dishRepository.remove(id);
  }
}
