import { Branch } from '../entity/branch.entity.js';
import { BranchResponseDto } from '../dto/response/branch-response.dto.js';

export class BranchMapper {
  static toResponse(entity: Branch): BranchResponseDto {
    const dto = new BranchResponseDto();
    dto.id = entity.id;
    dto.chainId = entity.chainId;
    dto.name = entity.name;
    dto.address = entity.address;
    dto.phone = entity.phone;
    dto.status = entity.status;
    dto.createdAt = entity.createdAt;
    return dto;
  }

  static toResponseList(entities: Branch[]): BranchResponseDto[] {
    return entities.map((e) => this.toResponse(e));
  }
}
