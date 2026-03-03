import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  Inject,
} from '@nestjs/common';
import type { RecipeService } from '../service/recipe.service.js';
import { RECIPE_SERVICE } from '../service/recipe.service.js';
import { CreateRecipeDto } from '../dto/request/create-recipe.dto.js';
import { UpdateRecipeDto } from '../dto/request/update-recipe.dto.js';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { ApiResponse } from '../../../common/response/api-response.js';

@Controller('recipes')
export class RecipeController {
  constructor(
    @Inject(RECIPE_SERVICE)
    private readonly recipeService: RecipeService,
  ) {}

  @Get()
  async findAll(@Query() query: PaginationQueryDto) {
    const data = await this.recipeService.findPaginated(
      query.page ?? 1,
      query.limit ?? 10,
      query.search,
    );
    return ApiResponse.ok(data);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const data = await this.recipeService.findById(id);
    return ApiResponse.ok(data);
  }

  @Get('dish/:dishId/active')
  async findActiveByDishId(@Param('dishId') dishId: string) {
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
    @Param('id') id: string,
    @Body() dto: UpdateRecipeDto,
  ) {
    const data = await this.recipeService.update(id, dto);
    return ApiResponse.ok(data, 'New version created');
  }

  @Patch(':id/activate')
  async activate(@Param('id') id: string) {
    const data = await this.recipeService.activate(id);
    return ApiResponse.ok(data, 'Recipe activated');
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.recipeService.delete(id);
    return ApiResponse.ok(null, 'Recipe deleted');
  }
}
