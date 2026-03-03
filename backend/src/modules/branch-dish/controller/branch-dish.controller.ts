import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject } from '@nestjs/common';
import type { BranchDishService } from '../service/branch-dish.service.js';
import { BRANCH_DISH_SERVICE } from '../service/branch-dish.service.js';
import { CreateBranchDishDto } from '../dto/request/create-branch-dish.dto.js';
import { UpdateBranchDishDto } from '../dto/request/update-branch-dish.dto.js';
import { ApiResponse } from '../../../common/response/api-response.js';

@Controller('branch-dishes')
export class BranchDishController {
  constructor(
    @Inject(BRANCH_DISH_SERVICE)
    private readonly service: BranchDishService,
  ) {}

  @Get()
  async findAll(@Query('branchId') branchId?: string, @Query('dishId') dishId?: string) {
    let data;
    if (branchId) {
      data = await this.service.findByBranch(branchId);
    } else if (dishId) {
      data = await this.service.findByDish(dishId);
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

  @Get('dish/:dishId')
  async findByDish(@Param('dishId') dishId: string) {
    const data = await this.service.findByDish(dishId);
    return ApiResponse.ok(data);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const data = await this.service.findById(id);
    return ApiResponse.ok(data);
  }

  @Post()
  async create(@Body() dto: CreateBranchDishDto) {
    const data = await this.service.create(dto);
    return ApiResponse.created(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateBranchDishDto) {
    const data = await this.service.update(id, dto);
    return ApiResponse.ok(data);
  }

  @Put(':branchId/:dishId/price')
  async updatePrice(
    @Param('branchId') branchId: string,
    @Param('dishId') dishId: string,
    @Body('price') price: number,
  ) {
    const data = await this.service.updatePrice(branchId, dishId, price);
    return ApiResponse.ok(data);
  }

  @Put(':branchId/:dishId/availability')
  async updateAvailability(
    @Param('branchId') branchId: string,
    @Param('dishId') dishId: string,
    @Body('isAvailable') isAvailable: boolean,
  ) {
    const data = await this.service.updateAvailability(branchId, dishId, isAvailable);
    return ApiResponse.ok(data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.service.delete(id);
    return ApiResponse.ok(null);
  }
}
