import { Injectable } from '@nestjs/common';
import { TableService } from './table.service.js';
import { TableRepository } from '../repository/table.repository.js';
import { CreateTableDto } from '../dto/request/create-table.dto.js';
import { UpdateTableDto } from '../dto/request/update-table.dto.js';
import { TableResponseDto } from '../dto/response/table-response.dto.js';
import { TableMapper } from '../mapper/table.mapper.js';
import { Table } from '../entity/table.entity.js';
import { EntityNotFoundException } from '../../../common/exception/exceptions/not-found.exception.js';

@Injectable()
export class TableServiceImpl implements TableService {
  constructor(private readonly tableRepository: TableRepository) {}

  async findAll(): Promise<TableResponseDto[]> {
    const tables = await this.tableRepository.findAll();
    return TableMapper.toResponseList(tables);
  }

  async findById(id: string): Promise<TableResponseDto> {
    const table = await this.tableRepository.findById(id);
    if (!table) {
      throw new EntityNotFoundException('Table', id);
    }
    return TableMapper.toResponse(table);
  }

  async findByBranchId(branchId: string): Promise<TableResponseDto[]> {
    const tables = await this.tableRepository.findByBranchId(branchId);
    return TableMapper.toResponseList(tables);
  }

  async findAvailableByBranch(branchId: string): Promise<TableResponseDto[]> {
    const tables = await this.tableRepository.findAvailableByBranch(branchId);
    return TableMapper.toResponseList(tables);
  }

  async create(dto: CreateTableDto): Promise<TableResponseDto> {
    const table = new Table();
    table.branchId = dto.branchId;
    table.tableCode = dto.tableCode;
    table.capacity = dto.capacity || 4;
    table.status = 'available';

    const saved = await this.tableRepository.save(table);
    return TableMapper.toResponse(saved);
  }

  async update(id: string, dto: UpdateTableDto): Promise<TableResponseDto> {
    const table = await this.tableRepository.findById(id);
    if (!table) {
      throw new EntityNotFoundException('Table', id);
    }

    if (dto.tableCode !== undefined) table.tableCode = dto.tableCode;
    if (dto.capacity !== undefined) table.capacity = dto.capacity;
    if (dto.status !== undefined) table.status = dto.status;

    const saved = await this.tableRepository.save(table);
    return TableMapper.toResponse(saved);
  }

  async updateStatus(id: string, status: string): Promise<TableResponseDto> {
    const table = await this.tableRepository.findById(id);
    if (!table) {
      throw new EntityNotFoundException('Table', id);
    }

    table.status = status;
    const saved = await this.tableRepository.save(table);
    return TableMapper.toResponse(saved);
  }

  async delete(id: string): Promise<void> {
    const table = await this.tableRepository.findById(id);
    if (!table) {
      throw new EntityNotFoundException('Table', id);
    }
    await this.tableRepository.remove(id);
  }
}
