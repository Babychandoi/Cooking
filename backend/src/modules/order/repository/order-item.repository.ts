import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItem } from '../entity/order-item.entity.js';

@Injectable()
export class OrderItemRepository {
  constructor(
    @InjectRepository(OrderItem)
    private readonly repo: Repository<OrderItem>,
  ) {}

  findByOrderId(orderId: string): Promise<OrderItem[]> {
    return this.repo.find({
      where: { orderId },
      relations: ['dish', 'ingredients', 'ingredients.ingredient'],
    });
  }

  save(item: OrderItem): Promise<OrderItem> {
    return this.repo.save(item);
  }
}
