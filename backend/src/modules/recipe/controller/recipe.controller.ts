import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  Inject,
} from '@nestjs/common';
import type { RecipeService } from '../service/recipe.service.js';
import { RECIPE_SERVICE } from '../service/recipe.service.js';
import { CreateRecipeDto } from '../dto/request/create-recipe.dto.js';
import { UpdateRecipeDto } from '../dto/request/update-recipe.dto.js';
import { ApiResponse } from '../../../common/response/api-response.js';

@Controller('recipes')
export class RecipeController {
  constructor(
    @Inject(RECIPE_SERVICE)
    private readonly recipeService: RecipeService,
  ) {}

  @Get()
  async findAll() {
    const data = await this.recipeService.findAll();
    return ApiResponse.ok(data);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const data = await this.recipeService.findById(id);
    return ApiResponse.ok(data);
  }

  @Get('dish/:dishId/active')
  async findActiveByDishId(@Param('dishId', ParseIntPipe) dishId: number) {
    const data = await this.recipeService.findActiveByDishId(dishId);
    return ApiResponse.ok(data);
  }

  @Post()
  async create(@Body() dto: CreateRecipeDto) {
    const data = await this.recipeService.create(dto);
    return ApiResponse.created(data);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRecipeDto,
  ) {
    const data = await this.recipeService.update(id, dto);
    return ApiResponse.ok(data, 'New version created');
  }

  @Patch(':id/activate')
  async activate(@Param('id', ParseIntPipe) id: number) {
    const data = await this.recipeService.activate(id);
    return ApiResponse.ok(data, 'Recipe activated');
  }
}
