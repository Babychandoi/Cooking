import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IngredientService } from './ingredient.service.js';
import { IngredientRepository } from '../repository/ingredient.repository.js';
import { CreateIngredientDto } from '../dto/request/create-ingredient.dto.js';
import { UpdateIngredientDto } from '../dto/request/update-ingredient.dto.js';
import { IngredientResponseDto } from '../dto/response/ingredient-response.dto.js';
import { IngredientMapper } from '../mapper/ingredient.mapper.js';
import { Ingredient } from '../entity/ingredient.entity.js';
import { RecipeItem } from '../../recipe/entity/recipe-item.entity.js';
import { Recipe } from '../../recipe/entity/recipe.entity.js';
import { OrderItemIngredient } from '../../order/entity/order-item-ingredient.entity.js';
import { Order, OrderStatus } from '../../order/entity/order.entity.js';
import { EntityNotFoundException } from '../../../common/exception/exceptions/not-found.exception.js';

@Injectable()
export class IngredientServiceImpl implements IngredientService {
  constructor(
    private readonly ingredientRepository: IngredientRepository,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<IngredientResponseDto[]> {
    const ingredients = await this.ingredientRepository.findAll();
    return IngredientMapper.toResponseList(ingredients);
  }

  async findById(id: number): Promise<IngredientResponseDto> {
    const ingredient = await this.ingredientRepository.findById(id);
    if (!ingredient) {
      throw new EntityNotFoundException('Ingredient', id);
    }
    return IngredientMapper.toResponse(ingredient);
  }

  async create(dto: CreateIngredientDto): Promise<IngredientResponseDto> {
    const ingredient = new Ingredient();
    ingredient.name = dto.name;
    ingredient.unit = dto.unit;
    ingredient.stock = dto.stock;

    const saved = await this.ingredientRepository.save(ingredient);
    return IngredientMapper.toResponse(saved);
  }

  async update(
    id: number,
    dto: UpdateIngredientDto,
  ): Promise<IngredientResponseDto> {
    const ingredient = await this.ingredientRepository.findById(id);
    if (!ingredient) {
      throw new EntityNotFoundException('Ingredient', id);
    }

    // Block unit change if ingredient is used in active recipes or cancellable orders
    if (dto.unit !== undefined && dto.unit !== ingredient.unit) {
      const activeRecipeItem = await this.dataSource
        .getRepository(RecipeItem)
        .createQueryBuilder('ri')
        .innerJoin(Recipe, 'r', 'r.id = ri.recipe_id')
        .where('ri.ingredient_id = :id', { id })
        .andWhere('r.isActive = :active', { active: true })
        .getOne();

      if (activeRecipeItem) {
        throw new BadRequestException(
          'Không thể đổi đơn vị vì nguyên liệu đang được sử dụng trong công thức',
        );
      }

      const cancellableOrderIngredient = await this.dataSource
        .getRepository(OrderItemIngredient)
        .createQueryBuilder('oii')
        .innerJoin('oii.orderItem', 'oi')
        .innerJoin(Order, 'o', 'o.id = oi.order_id')
        .where('oii.ingredient_id = :id', { id })
        .andWhere('o.status IN (:...statuses)', {
          statuses: [OrderStatus.PENDING, OrderStatus.CONFIRMED],
        })
        .getOne();

      if (cancellableOrderIngredient) {
        throw new BadRequestException(
          'Không thể đổi đơn vị vì còn đơn hàng chưa hoàn thành sử dụng nguyên liệu này',
        );
      }
    }

    if (dto.name !== undefined) ingredient.name = dto.name;
    if (dto.unit !== undefined) ingredient.unit = dto.unit;
    if (dto.stock !== undefined) ingredient.stock = dto.stock;

    const saved = await this.ingredientRepository.save(ingredient);
    return IngredientMapper.toResponse(saved);
  }

  async restock(
    id: number,
    quantity: number,
  ): Promise<IngredientResponseDto> {
    const ingredient = await this.ingredientRepository.findById(id);
    if (!ingredient) {
      throw new EntityNotFoundException('Ingredient', id);
    }

    ingredient.stock = Number(ingredient.stock) + quantity;
    const saved = await this.ingredientRepository.save(ingredient);
    return IngredientMapper.toResponse(saved);
  }

  async delete(id: number): Promise<void> {
    const ingredient = await this.ingredientRepository.findById(id);
    if (!ingredient) {
      throw new EntityNotFoundException('Ingredient', id);
    }

    // Check if any active recipe uses this ingredient
    const activeRecipeItem = await this.dataSource
      .getRepository(RecipeItem)
      .createQueryBuilder('ri')
      .innerJoin(Recipe, 'r', 'r.id = ri.recipe_id')
      .where('ri.ingredient_id = :id', { id })
      .andWhere('r.isActive = :active', { active: true })
      .getOne();

    if (activeRecipeItem) {
      throw new BadRequestException(
        'Không thể xóa nguyên liệu đang được sử dụng trong công thức',
      );
    }

    // Check if any cancellable order (PENDING/CONFIRMED) uses this ingredient
    const cancellableOrderIngredient = await this.dataSource
      .getRepository(OrderItemIngredient)
      .createQueryBuilder('oii')
      .innerJoin('oii.orderItem', 'oi')
      .innerJoin(Order, 'o', 'o.id = oi.order_id')
      .where('oii.ingredient_id = :id', { id })
      .andWhere('o.status IN (:...statuses)', {
        statuses: [OrderStatus.PENDING, OrderStatus.CONFIRMED],
      })
      .getOne();

    if (cancellableOrderIngredient) {
      throw new BadRequestException(
        'Không thể xóa nguyên liệu vì còn đơn hàng có thể hủy sử dụng nguyên liệu này',
      );
    }

    await this.ingredientRepository.remove(id);
  }
}
