import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Inject,
} from '@nestjs/common';
import type { IngredientService } from '../service/ingredient.service.js';
import { INGREDIENT_SERVICE } from '../service/ingredient.service.js';
import { CreateIngredientDto } from '../dto/request/create-ingredient.dto.js';
import { UpdateIngredientDto } from '../dto/request/update-ingredient.dto.js';
import { RestockIngredientDto } from '../dto/request/restock-ingredient.dto.js';
import { ApiResponse } from '../../../common/response/api-response.js';

@Controller('ingredients')
export class IngredientController {
  constructor(
    @Inject(INGREDIENT_SERVICE)
    private readonly ingredientService: IngredientService,
  ) {}

  @Get()
  async findAll() {
    const data = await this.ingredientService.findAll();
    return ApiResponse.ok(data);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const data = await this.ingredientService.findById(id);
    return ApiResponse.ok(data);
  }

  @Post()
  async create(@Body() dto: CreateIngredientDto) {
    const data = await this.ingredientService.create(dto);
    return ApiResponse.created(data);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateIngredientDto,
  ) {
    const data = await this.ingredientService.update(id, dto);
    return ApiResponse.ok(data, 'Updated');
  }

  @Patch(':id/restock')
  async restock(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RestockIngredientDto,
  ) {
    const data = await this.ingredientService.restock(id, dto.quantity);
    return ApiResponse.ok(data, 'Restocked');
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.ingredientService.delete(id);
    return ApiResponse.ok(null, 'Deleted');
  }
}
