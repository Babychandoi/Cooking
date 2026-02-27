import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Inject,
} from '@nestjs/common';
import type { DishService } from '../service/dish.service.js';
import { DISH_SERVICE } from '../service/dish.service.js';
import { CreateDishDto } from '../dto/request/create-dish.dto.js';
import { UpdateDishDto } from '../dto/request/update-dish.dto.js';
import { ApiResponse } from '../../../common/response/api-response.js';

@Controller('dishes')
export class DishController {
  constructor(
    @Inject(DISH_SERVICE)
    private readonly dishService: DishService,
  ) {}

  @Get()
  async findAll() {
    const data = await this.dishService.findAll();
    return ApiResponse.ok(data);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const data = await this.dishService.findById(id);
    return ApiResponse.ok(data);
  }

  @Post()
  async create(@Body() dto: CreateDishDto) {
    const data = await this.dishService.create(dto);
    return ApiResponse.created(data);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDishDto,
  ) {
    const data = await this.dishService.update(id, dto);
    return ApiResponse.ok(data, 'Updated');
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.dishService.delete(id);
    return ApiResponse.ok(null, 'Deleted');
  }
}
