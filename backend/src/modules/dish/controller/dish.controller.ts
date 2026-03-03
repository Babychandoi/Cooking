import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Inject,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { DishService } from '../service/dish.service.js';
import { DISH_SERVICE } from '../service/dish.service.js';
import { CreateDishDto } from '../dto/request/create-dish.dto.js';
import { UpdateDishDto } from '../dto/request/update-dish.dto.js';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { ApiResponse } from '../../../common/response/api-response.js';
import { UploadService } from '../../upload/service/upload.service.js';

@Controller('dishes')
export class DishController {
  constructor(
    @Inject(DISH_SERVICE)
    private readonly dishService: DishService,
    private readonly uploadService: UploadService,
  ) {}

  @Get()
  async findAll(@Query() query: PaginationQueryDto) {
    const data = await this.dishService.findPaginated(
      query.page ?? 1,
      query.limit ?? 10,
      query.search,
    );
    return ApiResponse.ok(data);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
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
    @Param('id') id: string,
    @Body() dto: UpdateDishDto,
  ) {
    const data = await this.dishService.update(id, dto);
    return ApiResponse.ok(data, 'Updated');
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.dishService.delete(id);
    return ApiResponse.ok(null, 'Deleted');
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      return ApiResponse.error('No file uploaded', 400);
    }
    const url = await this.uploadService.uploadFile(file);
    return ApiResponse.ok({ url });
  }
}
