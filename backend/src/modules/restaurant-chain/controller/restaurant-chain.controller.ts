import { Controller, Get, Post, Put, Delete, Body, Param, Inject } from '@nestjs/common';
import type { RestaurantChainService } from '../service/restaurant-chain.service.js';
import { RESTAURANT_CHAIN_SERVICE } from '../service/restaurant-chain.service.js';
import { CreateRestaurantChainDto } from '../dto/request/create-restaurant-chain.dto.js';
import { UpdateRestaurantChainDto } from '../dto/request/update-restaurant-chain.dto.js';
import { ApiResponse } from '../../../common/response/api-response.js';

@Controller('restaurant-chains')
export class RestaurantChainController {
  constructor(
    @Inject(RESTAURANT_CHAIN_SERVICE)
    private readonly service: RestaurantChainService,
  ) {}

  @Get()
  async findAll() {
    const data = await this.service.findAll();
    return ApiResponse.ok(data);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const data = await this.service.findById(id);
    return ApiResponse.ok(data);
  }

  @Post()
  async create(@Body() dto: CreateRestaurantChainDto) {
    const data = await this.service.create(dto);
    return ApiResponse.created(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateRestaurantChainDto) {
    const data = await this.service.update(id, dto);
    return ApiResponse.ok(data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.service.delete(id);
    return ApiResponse.ok(null);
  }
}
