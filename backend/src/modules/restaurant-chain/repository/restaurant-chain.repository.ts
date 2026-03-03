import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RestaurantChain } from '../entity/restaurant-chain.entity.js';

@Injectable()
export class RestaurantChainRepository {
  constructor(
    @InjectRepository(RestaurantChain)
    private readonly repo: Repository<RestaurantChain>,
  ) {}

  findAll(): Promise<RestaurantChain[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  findById(id: string): Promise<RestaurantChain | null> {
    return this.repo.findOne({ where: { id } });
  }

  save(chain: RestaurantChain): Promise<RestaurantChain> {
    return this.repo.save(chain);
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
