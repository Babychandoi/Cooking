import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dish } from '../entity/dish.entity.js';

@Injectable()
export class DishRepository {
  constructor(
    @InjectRepository(Dish)
    private readonly repo: Repository<Dish>,
  ) {}

  findAll(): Promise<Dish[]> {
    return this.repo.find();
  }

  findById(id: number): Promise<Dish | null> {
    return this.repo.findOne({ where: { id } });
  }

  findAvailable(): Promise<Dish[]> {
    return this.repo.find({ where: { isAvailable: true } });
  }

  save(dish: Dish): Promise<Dish> {
    return this.repo.save(dish);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
