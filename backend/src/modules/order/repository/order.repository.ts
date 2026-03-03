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

  async findPaginated(
    page: number,
    limit: number,
    search?: string,
  ): Promise<[Order[], number]> {
    const qb = this.repo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.dish', 'dish')
      .leftJoinAndSelect('items.ingredients', 'ingredients')
      .leftJoinAndSelect('ingredients.ingredient', 'ingredient');

    if (search) {
      qb.where(
        'order.orderNumber ILIKE :search OR order.id::text ILIKE :search',
        { search: `%${search}%` },
      );
    }

    qb.orderBy('order.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return qb.getManyAndCount();
  }

  findById(id: string): Promise<Order | null> {
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
