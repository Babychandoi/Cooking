import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItemIngredient } from '../entity/order-item-ingredient.entity.js';

@Injectable()
export class OrderItemIngredientRepository {
  constructor(
    @InjectRepository(OrderItemIngredient)
    private readonly repo: Repository<OrderItemIngredient>,
  ) {}

  findByOrderItemId(orderItemId: number): Promise<OrderItemIngredient[]> {
    return this.repo.find({
      where: { orderItemId },
      relations: ['ingredient'],
    });
  }

  save(item: OrderItemIngredient): Promise<OrderItemIngredient> {
    return this.repo.save(item);
  }

  saveMany(items: OrderItemIngredient[]): Promise<OrderItemIngredient[]> {
    return this.repo.save(items);
  }

  getRepository(): Repository<OrderItemIngredient> {
    return this.repo;
  }
}
