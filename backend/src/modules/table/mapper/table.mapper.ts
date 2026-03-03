import { Table } from '../entity/table.entity.js';
import { TableResponseDto } from '../dto/response/table-response.dto.js';

export class TableMapper {
  static toResponse(entity: Table): TableResponseDto {
    const dto = new TableResponseDto();
    dto.id = entity.id;
    dto.branchId = entity.branchId;
    dto.tableCode = entity.tableCode;
    dto.capacity = entity.capacity;
    dto.status = entity.status;
    return dto;
  }

  static toResponseList(entities: Table[]): TableResponseDto[] {
    return entities.map((e) => this.toResponse(e));
  }
}
