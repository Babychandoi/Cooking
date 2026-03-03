import { Injectable, NotFoundException } from '@nestjs/common';
import { RestaurantChainService } from './restaurant-chain.service.js';
import { RestaurantChainRepository } from '../repository/restaurant-chain.repository.js';
import { RestaurantChainMapper } from '../mapper/restaurant-chain.mapper.js';
import { RestaurantChainResponseDto } from '../dto/response/restaurant-chain-response.dto.js';
import { CreateRestaurantChainDto } from '../dto/request/create-restaurant-chain.dto.js';
import { UpdateRestaurantChainDto } from '../dto/request/update-restaurant-chain.dto.js';
import { RestaurantChain } from '../entity/restaurant-chain.entity.js';

@Injectable()
export class RestaurantChainServiceImpl implements RestaurantChainService {
  constructor(private readonly repository: RestaurantChainRepository) {}

  async findAll(): Promise<RestaurantChainResponseDto[]> {
    const chains = await this.repository.findAll();
    return RestaurantChainMapper.toDtoList(chains);
  }

  async findById(id: string): Promise<RestaurantChainResponseDto> {
    const chain = await this.repository.findById(id);
    if (!chain) {
      throw new NotFoundException(`Restaurant chain with ID ${id} not found`);
    }
    return RestaurantChainMapper.toDto(chain);
  }

  async create(dto: CreateRestaurantChainDto): Promise<RestaurantChainResponseDto> {
    const chain = new RestaurantChain();
    chain.name = dto.name;
    chain.status = dto.status || 'active';

    const saved = await this.repository.save(chain);
    return RestaurantChainMapper.toDto(saved);
  }

  async update(id: string, dto: UpdateRestaurantChainDto): Promise<RestaurantChainResponseDto> {
    const chain = await this.repository.findById(id);
    if (!chain) {
      throw new NotFoundException(`Restaurant chain with ID ${id} not found`);
    }

    if (dto.name !== undefined) chain.name = dto.name;
    if (dto.status !== undefined) chain.status = dto.status;

    const updated = await this.repository.save(chain);
    return RestaurantChainMapper.toDto(updated);
  }

  async delete(id: string): Promise<void> {
    const chain = await this.repository.findById(id);
    if (!chain) {
      throw new NotFoundException(`Restaurant chain with ID ${id} not found`);
    }
    await this.repository.remove(id);
  }
}
