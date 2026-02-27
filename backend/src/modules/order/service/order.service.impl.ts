import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OrderService } from './order.service.js';
import { OrderRepository } from '../repository/order.repository.js';
import { DishRepository } from '../../dish/repository/dish.repository.js';
import { RecipeRepository } from '../../recipe/repository/recipe.repository.js';
import { StockCheckerService } from './stock-checker.service.js';
import { OrderCancelService } from './order-cancel.service.js';
import { CreateOrderDto } from '../dto/request/create-order.dto.js';
import { OrderResponseDto } from '../dto/response/order-response.dto.js';
import { OrderMapper } from '../mapper/order.mapper.js';
import { Order, OrderStatus } from '../entity/order.entity.js';
import { OrderItem } from '../entity/order-item.entity.js';
import { OrderItemIngredient } from '../entity/order-item-ingredient.entity.js';
import { Ingredient } from '../../ingredient/entity/ingredient.entity.js';
import { EntityNotFoundException } from '../../../common/exception/exceptions/not-found.exception.js';
import { BadRequestException } from '@nestjs/common';
import { PaginatedResponse } from '../../../common/response/paginated-response.js';

@Injectable()
export class OrderServiceImpl implements OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly dishRepository: DishRepository,
    private readonly recipeRepository: RecipeRepository,
    private readonly stockCheckerService: StockCheckerService,
    private readonly orderCancelService: OrderCancelService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<OrderResponseDto[]> {
    const orders = await this.orderRepository.findAll();
    return OrderMapper.toResponseList(orders);
  }

  async findPaginated(
    page: number,
    limit: number,
    search?: string,
  ): Promise<PaginatedResponse<OrderResponseDto>> {
    const [items, total] = await this.orderRepository.findPaginated(page, limit, search);
    const dtos = OrderMapper.toResponseList(items);
    return new PaginatedResponse(dtos, total, page, limit);
  }

  async findById(id: number): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new EntityNotFoundException('Order', id);
    }
    return OrderMapper.toResponse(order);
  }

  async create(dto: CreateOrderDto): Promise<OrderResponseDto> {
    // Check stock availability
    const stockCheckItems = dto.items.map((item) => ({
      dishId: item.dishId,
      quantity: item.quantity,
    }));

    await this.stockCheckerService.checkStock(stockCheckItems);

    // Execute in transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = new Order();
      order.customerName = dto.customerName || '';
      order.tableNumber = dto.tableNumber || 0;
      order.note = dto.note || '';
      order.status = OrderStatus.PENDING;

      let totalPrice = 0;
      const orderItems: OrderItem[] = [];

      for (const itemDto of dto.items) {
        // Get dish and its active recipe
        const dish = await this.dishRepository.findById(itemDto.dishId);
        if (!dish) {
          throw new EntityNotFoundException('Dish', itemDto.dishId);
        }

        const recipe = await this.recipeRepository.findActiveByDishId(itemDto.dishId);
        if (!recipe) {
          throw new EntityNotFoundException('Active Recipe for Dish', itemDto.dishId);
        }

        const orderItem = new OrderItem();
        orderItem.dishId = itemDto.dishId;
        orderItem.quantity = itemDto.quantity;
        orderItem.unitPrice = Number(dish.price);
        orderItem.recipeVersion = recipe.version;

        totalPrice += Number(dish.price) * itemDto.quantity;

        // Create snapshot of ingredients used (for cancel/restore)
        const orderItemIngredients: OrderItemIngredient[] = [];
        for (const recipeItem of recipe.items) {
          const totalQty = Number(recipeItem.quantity) * itemDto.quantity;

          const oii = new OrderItemIngredient();
          oii.ingredientId = recipeItem.ingredientId;
          oii.quantity = totalQty;
          oii.unit = recipeItem.unit;
          oii.isRestored = false;

          orderItemIngredients.push(oii);

          // Deduct stock - read WITHIN transaction to avoid stale reads
          // when same ingredient appears in multiple order items
          const ingredient = await queryRunner.manager.findOne(Ingredient, {
            where: { id: recipeItem.ingredientId },
          });
          if (ingredient) {
            ingredient.stock = Number(ingredient.stock) - totalQty;
            await queryRunner.manager.save(ingredient);
          }
        }

        orderItem.ingredients = orderItemIngredients;
        orderItems.push(orderItem);
      }

      order.totalPrice = totalPrice;
      order.items = orderItems;

      const saved = await queryRunner.manager.save(order);
      await queryRunner.commitTransaction();

      const full = await this.orderRepository.findById(saved.id);
      return OrderMapper.toResponse(full!);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateStatus(id: number, status: OrderStatus): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new EntityNotFoundException('Order', id);
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING],
      [OrderStatus.PREPARING]: [OrderStatus.COMPLETED],
    };

    const allowed = validTransitions[order.status] || [];
    if (!allowed.includes(status)) {
      throw new BadRequestException(
        `Không thể chuyển trạng thái từ "${order.status}" sang "${status}"`,
      );
    }

    order.status = status;
    await this.orderRepository.save(order);

    const full = await this.orderRepository.findById(id);
    return OrderMapper.toResponse(full!);
  }

  async cancel(id: number, reason?: string): Promise<OrderResponseDto> {
    return this.orderCancelService.cancel(id, reason);
  }
}
