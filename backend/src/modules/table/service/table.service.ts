import { CreateTableDto } from '../dto/request/create-table.dto.js';
import { UpdateTableDto } from '../dto/request/update-table.dto.js';
import { TableResponseDto } from '../dto/response/table-response.dto.js';

export interface TableService {
  findAll(): Promise<TableResponseDto[]>;
  findById(id: string): Promise<TableResponseDto>;
  findByBranchId(branchId: string): Promise<TableResponseDto[]>;
  findAvailableByBranch(branchId: string): Promise<TableResponseDto[]>;
  create(dto: CreateTableDto): Promise<TableResponseDto>;
  update(id: string, dto: UpdateTableDto): Promise<TableResponseDto>;
  updateStatus(id: string, status: string): Promise<TableResponseDto>;
  delete(id: string): Promise<void>;
}

export const TABLE_SERVICE = 'TABLE_SERVICE';
