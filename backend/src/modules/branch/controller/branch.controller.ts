import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Inject,
} from '@nestjs/common';
import type { BranchService } from '../service/branch.service.js';
import { BRANCH_SERVICE } from '../service/branch.service.js';
import { CreateBranchDto } from '../dto/request/create-branch.dto.js';
import { UpdateBranchDto } from '../dto/request/update-branch.dto.js';
import { ApiResponse } from '../../../common/response/api-response.js';

@Controller('branches')
export class BranchController {
  constructor(
    @Inject(BRANCH_SERVICE)
    private readonly branchService: BranchService,
  ) {}

  @Get()
  async findAll() {
    const data = await this.branchService.findAll();
    return ApiResponse.ok(data);
  }

  @Get('chain/:chainId')
  async findByChainId(@Param('chainId') chainId: string) {
    const data = await this.branchService.findByChainId(chainId);
    return ApiResponse.ok(data);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const data = await this.branchService.findById(id);
    return ApiResponse.ok(data);
  }

  @Post()
  async create(@Body() dto: CreateBranchDto) {
    const data = await this.branchService.create(dto);
    return ApiResponse.created(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateBranchDto) {
    const data = await this.branchService.update(id, dto);
    return ApiResponse.ok(data, 'Updated');
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.branchService.delete(id);
    return ApiResponse.ok(null, 'Deleted');
  }
}
