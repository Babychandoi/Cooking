import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entity/order.entity.js';

@Injectable()
export class OrderRepository {
  constructor(
    @InjectRepository(Order)
    private readonly repo: Repository<Order>,
  ) {}

  findAll(): Promise<Order[]> {
    return this.repo.find({
      relations: ['items', 'items.dish', 'items.ingredients', 'items.ingredients.ingredient'],
      order: { createdAt: 'DESC' },
    });
  }

  findById(id: number): Promise<Order | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['items', 'items.dish', 'items.ingredients', 'items.ingredients.ingredient'],
    });
  }

  save(order: Order): Promise<Order> {
    return this.repo.save(order);
  }

  getRepository(): Repository<Order> {
    return this.repo;
  }
}
