import { Injectable } from '@nestjs/common';
import { BranchService } from './branch.service.js';
import { BranchRepository } from '../repository/branch.repository.js';
import { CreateBranchDto } from '../dto/request/create-branch.dto.js';
import { UpdateBranchDto } from '../dto/request/update-branch.dto.js';
import { BranchResponseDto } from '../dto/response/branch-response.dto.js';
import { BranchMapper } from '../mapper/branch.mapper.js';
import { Branch } from '../entity/branch.entity.js';
import { EntityNotFoundException } from '../../../common/exception/exceptions/not-found.exception.js';

@Injectable()
export class BranchServiceImpl implements BranchService {
  constructor(private readonly branchRepository: BranchRepository) {}

  async findAll(): Promise<BranchResponseDto[]> {
    const branches = await this.branchRepository.findAll();
    return BranchMapper.toResponseList(branches);
  }

  async findById(id: string): Promise<BranchResponseDto> {
    const branch = await this.branchRepository.findById(id);
    if (!branch) {
      throw new EntityNotFoundException('Branch', id);
    }
    return BranchMapper.toResponse(branch);
  }

  async findByChainId(chainId: string): Promise<BranchResponseDto[]> {
    const branches = await this.branchRepository.findByChainId(chainId);
    return BranchMapper.toResponseList(branches);
  }

  async create(dto: CreateBranchDto): Promise<BranchResponseDto> {
    const branch = new Branch();
    branch.chainId = dto.chainId;
    branch.name = dto.name;
    branch.address = dto.address || '';
    branch.phone = dto.phone || '';
    branch.status = 'active';

    const saved = await this.branchRepository.save(branch);
    return BranchMapper.toResponse(saved);
  }

  async update(id: string, dto: UpdateBranchDto): Promise<BranchResponseDto> {
    const branch = await this.branchRepository.findById(id);
    if (!branch) {
      throw new EntityNotFoundException('Branch', id);
    }

    if (dto.name !== undefined) branch.name = dto.name;
    if (dto.address !== undefined) branch.address = dto.address;
    if (dto.phone !== undefined) branch.phone = dto.phone;
    if (dto.status !== undefined) branch.status = dto.status;

    const saved = await this.branchRepository.save(branch);
    return BranchMapper.toResponse(saved);
  }

  async delete(id: string): Promise<void> {
    const branch = await this.branchRepository.findById(id);
    if (!branch) {
      throw new EntityNotFoundException('Branch', id);
    }
    await this.branchRepository.remove(id);
  }
}
