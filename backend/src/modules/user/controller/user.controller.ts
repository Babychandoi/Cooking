import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from '../service/user.service.js';
import { CreateUserDto } from '../dto/create-user.dto.js';
import { UpdateUserDto } from '../dto/update-user.dto.js';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { ApiResponse } from '../../../common/response/api-response.js';
import { Roles } from '../../auth/decorator/roles.decorator.js';
import { UserRole } from '../entity/user.entity.js';

@Controller('users')
@Roles(UserRole.ADMIN)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(@Query() query: PaginationQueryDto) {
    const data = await this.userService.findPaginated(
      query.page ?? 1,
      query.limit ?? 10,
      query.search,
    );
    return ApiResponse.ok(data, 'Lấy danh sách nhân viên thành công');
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const data = await this.userService.findById(id);
    return ApiResponse.ok(data);
  }

  @Post()
  async create(@Body() dto: CreateUserDto) {
    const data = await this.userService.create(dto);
    return ApiResponse.created(data, 'Tạo nhân viên thành công');
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    const data = await this.userService.update(id, dto);
    return ApiResponse.ok(data, 'Cập nhật nhân viên thành công');
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.userService.delete(id);
    return ApiResponse.ok(null, 'Xóa nhân viên thành công');
  }
}
