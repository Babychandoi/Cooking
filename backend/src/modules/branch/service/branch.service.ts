import { CreateBranchDto } from '../dto/request/create-branch.dto.js';
import { UpdateBranchDto } from '../dto/request/update-branch.dto.js';
import { BranchResponseDto } from '../dto/response/branch-response.dto.js';

export interface BranchService {
  findAll(): Promise<BranchResponseDto[]>;
  findById(id: string): Promise<BranchResponseDto>;
  findByChainId(chainId: string): Promise<BranchResponseDto[]>;
  create(dto: CreateBranchDto): Promise<BranchResponseDto>;
  update(id: string, dto: UpdateBranchDto): Promise<BranchResponseDto>;
  delete(id: string): Promise<void>;
}

export const BRANCH_SERVICE = 'BRANCH_SERVICE';
