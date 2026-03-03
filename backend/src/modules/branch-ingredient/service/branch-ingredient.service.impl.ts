import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { BranchIngredientService } from './branch-ingredient.service.js';
import { BranchIngredientRepository } from '../repository/branch-ingredient.repository.js';
import { BranchIngredientMapper } from '../mapper/branch-ingredient.mapper.js';
import { BranchIngredientResponseDto } from '../dto/response/branch-ingredient-response.dto.js';
import { CreateBranchIngredientDto } from '../dto/request/create-branch-ingredient.dto.js';
import { UpdateBranchIngredientDto } from '../dto/request/update-branch-ingredient.dto.js';
import { BranchIngredient } from '../entity/branch-ingredient.entity.js';

@Injectable()
export class BranchIngredientServiceImpl implements BranchIngredientService {
  constructor(private readonly repository: BranchIngredientRepository) {}

  async findAll(): Promise<BranchIngredientResponseDto[]> {
    const branchIngredients = await this.repository.findAll();
    return BranchIngredientMapper.toDtoList(branchIngredients);
  }

  async findById(id: string): Promise<BranchIngredientResponseDto> {
    const branchIngredient = await this.repository.findById(id);
    if (!branchIngredient) {
      throw new NotFoundException(`Branch ingredient with ID ${id} not found`);
    }
    return BranchIngredientMapper.toDto(branchIngredient);
  }

  async findByBranch(branchId: string): Promise<BranchIngredientResponseDto[]> {
    const branchIngredients = await this.repository.findByBranch(branchId);
    return BranchIngredientMapper.toDtoList(branchIngredients);
  }

  async findByIngredient(ingredientId: string): Promise<BranchIngredientResponseDto[]> {
    const branchIngredients = await this.repository.findByIngredient(ingredientId);
    return BranchIngredientMapper.toDtoList(branchIngredients);
  }

  async create(dto: CreateBranchIngredientDto): Promise<BranchIngredientResponseDto> {
    const branchIngredient = new BranchIngredient();
    branchIngredient.branchId = dto.branchId;
    branchIngredient.ingredientId = dto.ingredientId;
    branchIngredient.stockQuantity = dto.stockQuantity ?? 0;
    branchIngredient.costPrice = dto.costPrice ?? null;

    const saved = await this.repository.save(branchIngredient);
    const loaded = await this.repository.findById(saved.id);
    return BranchIngredientMapper.toDto(loaded!);
  }

  async update(id: string, dto: UpdateBranchIngredientDto): Promise<BranchIngredientResponseDto> {
    const branchIngredient = await this.repository.findById(id);
    if (!branchIngredient) {
      throw new NotFoundException(`Branch ingredient with ID ${id} not found`);
    }

    if (dto.stockQuantity !== undefined) branchIngredient.stockQuantity = dto.stockQuantity;
    if (dto.costPrice !== undefined) branchIngredient.costPrice = dto.costPrice;

    const updated = await this.repository.save(branchIngredient);
    return BranchIngredientMapper.toDto(updated);
  }

  async updateStock(branchId: string, ingredientId: string, quantity: number): Promise<BranchIngredientResponseDto> {
    const branchIngredient = await this.repository.findByBranchAndIngredient(branchId, ingredientId);
    if (!branchIngredient) {
      throw new NotFoundException(`Branch ingredient not found for branch ${branchId} and ingredient ${ingredientId}`);
    }

    branchIngredient.stockQuantity = quantity;
    const updated = await this.repository.save(branchIngredient);
    return BranchIngredientMapper.toDto(updated);
  }

  async restock(branchId: string, ingredientId: string, quantity: number): Promise<BranchIngredientResponseDto> {
    if (quantity <= 0) {
      throw new BadRequestException('Restock quantity must be positive');
    }

    const branchIngredient = await this.repository.findByBranchAndIngredient(branchId, ingredientId);
    if (!branchIngredient) {
      throw new NotFoundException(`Branch ingredient not found for branch ${branchId} and ingredient ${ingredientId}`);
    }

    branchIngredient.stockQuantity += quantity;
    const updated = await this.repository.save(branchIngredient);
    return BranchIngredientMapper.toDto(updated);
  }

  async delete(id: string): Promise<void> {
    const branchIngredient = await this.repository.findById(id);
    if (!branchIngredient) {
      throw new NotFoundException(`Branch ingredient with ID ${id} not found`);
    }
    await this.repository.remove(id);
  }
}
