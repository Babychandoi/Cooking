import { TableSession } from '../entity/table-session.entity.js';
import { TableSessionResponseDto } from '../dto/response/table-session-response.dto.js';

export class TableSessionMapper {
  static toResponse(entity: TableSession): TableSessionResponseDto {
    const dto = new TableSessionResponseDto();
    dto.id = entity.id;
    dto.tableId = entity.tableId;
    dto.openedAt = entity.openedAt;
    dto.closedAt = entity.closedAt;
    dto.status = entity.status;
    return dto;
  }

  static toResponseList(entities: TableSession[]): TableSessionResponseDto[] {
    return entities.map((e) => this.toResponse(e));
  }
}
