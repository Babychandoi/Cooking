import { Injectable, NotFoundException } from '@nestjs/common';
import { BranchDishService } from './branch-dish.service.js';
import { BranchDishRepository } from '../repository/branch-dish.repository.js';
import { BranchDishMapper } from '../mapper/branch-dish.mapper.js';
import { BranchDishResponseDto } from '../dto/response/branch-dish-response.dto.js';
import { CreateBranchDishDto } from '../dto/request/create-branch-dish.dto.js';
import { UpdateBranchDishDto } from '../dto/request/update-branch-dish.dto.js';
import { BranchDish } from '../entity/branch-dish.entity.js';

@Injectable()
export class BranchDishServiceImpl implements BranchDishService {
  constructor(private readonly repository: BranchDishRepository) {}

  async findAll(): Promise<BranchDishResponseDto[]> {
    const branchDishes = await this.repository.findAll();
    return BranchDishMapper.toDtoList(branchDishes);
  }

  async findById(id: string): Promise<BranchDishResponseDto> {
    const branchDish = await this.repository.findById(id);
    if (!branchDish) {
      throw new NotFoundException(`Branch dish with ID ${id} not found`);
    }
    return BranchDishMapper.toDto(branchDish);
  }

  async findByBranch(branchId: string): Promise<BranchDishResponseDto[]> {
    const branchDishes = await this.repository.findByBranch(branchId);
    return BranchDishMapper.toDtoList(branchDishes);
  }

  async findByDish(dishId: string): Promise<BranchDishResponseDto[]> {
    const branchDishes = await this.repository.findByDish(dishId);
    return BranchDishMapper.toDtoList(branchDishes);
  }

  async create(dto: CreateBranchDishDto): Promise<BranchDishResponseDto> {
    const branchDish = new BranchDish();
    branchDish.branchId = dto.branchId;
    branchDish.dishId = dto.dishId;
    branchDish.price = dto.price;
    branchDish.isAvailable = dto.isAvailable ?? true;
    branchDish.status = dto.status || 'active';

    const saved = await this.repository.save(branchDish);
    const loaded = await this.repository.findById(saved.id);
    return BranchDishMapper.toDto(loaded!);
  }

  async update(id: string, dto: UpdateBranchDishDto): Promise<BranchDishResponseDto> {
    const branchDish = await this.repository.findById(id);
    if (!branchDish) {
      throw new NotFoundException(`Branch dish with ID ${id} not found`);
    }

    if (dto.price !== undefined) branchDish.price = dto.price;
    if (dto.isAvailable !== undefined) branchDish.isAvailable = dto.isAvailable;
    if (dto.status !== undefined) branchDish.status = dto.status;

    const updated = await this.repository.save(branchDish);
    return BranchDishMapper.toDto(updated);
  }

  async updatePrice(branchId: string, dishId: string, price: number): Promise<BranchDishResponseDto> {
    const branchDish = await this.repository.findByBranchAndDish(branchId, dishId);
    if (!branchDish) {
      throw new NotFoundException(`Branch dish not found for branch ${branchId} and dish ${dishId}`);
    }

    branchDish.price = price;
    const updated = await this.repository.save(branchDish);
    return BranchDishMapper.toDto(updated);
  }

  async updateAvailability(branchId: string, dishId: string, isAvailable: boolean): Promise<BranchDishResponseDto> {
    const branchDish = await this.repository.findByBranchAndDish(branchId, dishId);
    if (!branchDish) {
      throw new NotFoundException(`Branch dish not found for branch ${branchId} and dish ${dishId}`);
    }

    branchDish.isAvailable = isAvailable;
    const updated = await this.repository.save(branchDish);
    return BranchDishMapper.toDto(updated);
  }

  async delete(id: string): Promise<void> {
    const branchDish = await this.repository.findById(id);
    if (!branchDish) {
      throw new NotFoundException(`Branch dish with ID ${id} not found`);
    }
    await this.repository.remove(id);
  }
}
