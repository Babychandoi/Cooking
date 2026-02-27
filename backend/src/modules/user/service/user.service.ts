import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../repository/user.repository.js';
import { User } from '../entity/user.entity.js';
import { CreateUserDto } from '../dto/create-user.dto.js';
import { UpdateUserDto } from '../dto/update-user.dto.js';
import { UserResponseDto } from '../dto/user-response.dto.js';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findAll();
    return users.map((u) => this.toDto(u));
  }

  async findById(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Nhân viên không tồn tại');
    }
    return this.toDto(user);
  }

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email đã được sử dụng');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.userRepository.create({
      fullName: dto.fullName,
      email: dto.email,
      password: hashedPassword,
      phone: dto.phone || '',
      role: dto.role,
    });
    return this.toDto(user);
  }

  async update(id: number, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Nhân viên không tồn tại');
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepository.findByEmailExcludeId(dto.email, id);
      if (existing) {
        throw new ConflictException('Email đã được sử dụng');
      }
      user.email = dto.email;
    }

    if (dto.fullName !== undefined) user.fullName = dto.fullName;
    if (dto.phone !== undefined) user.phone = dto.phone;
    if (dto.role !== undefined) user.role = dto.role;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;

    if (dto.password) {
      user.password = await bcrypt.hash(dto.password, 10);
    }

    const saved = await this.userRepository.save(user);
    return this.toDto(saved);
  }

  async delete(id: number): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Nhân viên không tồn tại');
    }
    await this.userRepository.delete(id);
  }

  private toDto(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.fullName = user.fullName;
    dto.email = user.email;
    dto.phone = user.phone || '';
    dto.role = user.role;
    dto.isActive = user.isActive;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }
}
