import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, Inject } from '@nestjs/common';
import type { BranchIngredientService } from '../service/branch-ingredient.service.js';
import { BRANCH_INGREDIENT_SERVICE } from '../service/branch-ingredient.service.js';
import { CreateBranchIngredientDto } from '../dto/request/create-branch-ingredient.dto.js';
import { UpdateBranchIngredientDto } from '../dto/request/update-branch-ingredient.dto.js';
import { ApiResponse } from '../../../common/response/api-response.js';

@Controller('branch-ingredients')
export class BranchIngredientController {
  constructor(
    @Inject(BRANCH_INGREDIENT_SERVICE)
    private readonly service: BranchIngredientService,
  ) {}

  @Get()
  async findAll(@Query('branchId') branchId?: string, @Query('ingredientId') ingredientId?: string) {
    let data;
    if (branchId) {
      data = await this.service.findByBranch(branchId);
    } else if (ingredientId) {
      data = await this.service.findByIngredient(ingredientId);
    } else {
      data = await this.service.findAll();
    }
    return ApiResponse.ok(data);
  }

  @Get('branch/:branchId')
  async findByBranch(@Param('branchId') branchId: string) {
    const data = await this.service.findByBranch(branchId);
    return ApiResponse.ok(data);
  }

  @Get('ingredient/:ingredientId')
  async findByIngredient(@Param('ingredientId') ingredientId: string) {
    const data = await this.service.findByIngredient(ingredientId);
    return ApiResponse.ok(data);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const data = await this.service.findById(id);
    return ApiResponse.ok(data);
  }

  @Post()
  async create(@Body() dto: CreateBranchIngredientDto) {
    const data = await this.service.create(dto);
    return ApiResponse.created(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateBranchIngredientDto) {
    const data = await this.service.update(id, dto);
    return ApiResponse.ok(data);
  }

  @Patch(':id/restock')
  async restockById(@Param('id') id: string, @Body('quantity') quantity: number) {
    const branchIngredient = await this.service.findById(id);
    const data = await this.service.restock(branchIngredient.branchId, branchIngredient.ingredientId, quantity);
    return ApiResponse.ok(data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.service.delete(id);
    return ApiResponse.ok(null);
  }
}
