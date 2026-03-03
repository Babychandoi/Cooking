import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
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

  async findPaginated(
    page: number,
    limit: number,
    search?: string,
  ): Promise<[Dish[], number]> {
    const where = search ? { name: ILike(`%${search}%`) } : {};
    return this.repo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'ASC' },
    });
  }

  findById(id: string): Promise<Dish | null> {
    return this.repo.findOne({ where: { id } });
  }

  save(dish: Dish): Promise<Dish> {
    return this.repo.save(dish);
  }

  async remove(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}
