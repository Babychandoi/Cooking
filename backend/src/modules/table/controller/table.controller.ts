import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Patch,
  Inject,
} from '@nestjs/common';
import type { TableService } from '../service/table.service.js';
import { TABLE_SERVICE } from '../service/table.service.js';
import { CreateTableDto } from '../dto/request/create-table.dto.js';
import { UpdateTableDto } from '../dto/request/update-table.dto.js';
import { ApiResponse } from '../../../common/response/api-response.js';

@Controller('tables')
export class TableController {
  constructor(
    @Inject(TABLE_SERVICE)
    private readonly tableService: TableService,
  ) {}

  @Get()
  async findAll() {
    const data = await this.tableService.findAll();
    return ApiResponse.ok(data);
  }

  @Get('branch/:branchId')
  async findByBranchId(@Param('branchId') branchId: string) {
    const data = await this.tableService.findByBranchId(branchId);
    return ApiResponse.ok(data);
  }

  @Get('branch/:branchId/available')
  async findAvailableByBranch(@Param('branchId') branchId: string) {
    const data = await this.tableService.findAvailableByBranch(branchId);
    return ApiResponse.ok(data);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const data = await this.tableService.findById(id);
    return ApiResponse.ok(data);
  }

  @Post()
  async create(@Body() dto: CreateTableDto) {
    const data = await this.tableService.create(dto);
    return ApiResponse.created(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTableDto) {
    const data = await this.tableService.update(id, dto);
    return ApiResponse.ok(data, 'Updated');
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    const data = await this.tableService.updateStatus(id, status);
    return ApiResponse.ok(data, 'Status updated');
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.tableService.delete(id);
    return ApiResponse.ok(null, 'Deleted');
  }
}
