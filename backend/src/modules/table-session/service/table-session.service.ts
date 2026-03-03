import { CreateTableSessionDto } from '../dto/request/create-table-session.dto.js';
import { TableSessionResponseDto } from '../dto/response/table-session-response.dto.js';

export interface TableSessionService {
  findAll(): Promise<TableSessionResponseDto[]>;
  findById(id: string): Promise<TableSessionResponseDto>;
  findActiveByTable(tableId: string): Promise<TableSessionResponseDto | null>;
  findByTable(tableId: string): Promise<TableSessionResponseDto[]>;
  openSession(dto: CreateTableSessionDto): Promise<TableSessionResponseDto>;
  closeSession(id: string): Promise<TableSessionResponseDto>;
  getSessionTotal(id: string): Promise<number>;
}

export const TABLE_SESSION_SERVICE = 'TABLE_SESSION_SERVICE';
