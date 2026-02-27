import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from '../src/modules/user/service/user.service.js';
import { UserRepository } from '../src/modules/user/repository/user.repository.js';
import { User, UserRole } from '../src/modules/user/entity/user.entity.js';
import { PaginatedResponse } from '../src/common/response/paginated-response.js';

jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UserService', () => {
  let service: UserService;
  let userRepo: jest.Mocked<UserRepository>;

  const mockUser = (overrides: Partial<User> = {}): User => {
    const u = new User();
    u.id = 1;
    u.fullName = 'Nguyễn Văn A';
    u.email = 'a@example.com';
    u.password = '$2b$10$hashedpassword';
    u.phone = '0123456789';
    u.role = UserRole.USER;
    u.isActive = true;
    u.createdAt = new Date('2024-01-01');
    u.updatedAt = new Date('2024-01-01');
    return Object.assign(u, overrides);
  };

  beforeEach(async () => {
    userRepo = {
      findAll: jest.fn(),
      findPaginated: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByEmailExcludeId: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: userRepo },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('findAll', () => {
    it('should return all users as DTOs (without password)', async () => {
      userRepo.findAll.mockResolvedValue([mockUser()]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].fullName).toBe('Nguyễn Văn A');
      expect(result[0]).not.toHaveProperty('password');
    });
  });

  describe('findPaginated', () => {
    it('should return paginated response', async () => {
      userRepo.findPaginated.mockResolvedValue([[mockUser()], 1]);

      const result = await service.findPaginated(1, 10, 'nguyễn');

      expect(result).toBeInstanceOf(PaginatedResponse);
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('findById', () => {
    it('should return user DTO when found', async () => {
      userRepo.findById.mockResolvedValue(mockUser());

      const result = await service.findById(1);

      expect(result.id).toBe(1);
      expect(result.email).toBe('a@example.com');
    });

    it('should throw NotFoundException when not found', async () => {
      userRepo.findById.mockResolvedValue(null);

      await expect(service.findById(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should hash password and create user', async () => {
      userRepo.findByEmail.mockResolvedValue(null);
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashed123');
      userRepo.create.mockResolvedValue(mockUser());

      const result = await service.create({
        fullName: 'Nguyễn Văn A',
        email: 'a@example.com',
        password: 'password123',
        role: UserRole.USER,
      });

      expect(mockedBcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(userRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ password: 'hashed123' }),
      );
      expect(result.fullName).toBe('Nguyễn Văn A');
    });

    it('should throw ConflictException when email already exists', async () => {
      userRepo.findByEmail.mockResolvedValue(mockUser());

      await expect(
        service.create({
          fullName: 'Test',
          email: 'a@example.com',
          password: 'pass',
          role: UserRole.USER,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update user fields', async () => {
      const user = mockUser();
      userRepo.findById.mockResolvedValue(user);
      userRepo.save.mockImplementation(async (u) => u);

      const result = await service.update(1, { fullName: 'Trần B' });

      expect(result.fullName).toBe('Trần B');
    });

    it('should hash password when password is provided', async () => {
      const user = mockUser();
      userRepo.findById.mockResolvedValue(user);
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue('newhashed');
      userRepo.save.mockImplementation(async (u) => u);

      await service.update(1, { password: 'newpassword' });

      expect(mockedBcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
      expect(user.password).toBe('newhashed');
    });

    it('should check email uniqueness when email changes', async () => {
      const user = mockUser();
      userRepo.findById.mockResolvedValue(user);
      userRepo.findByEmailExcludeId.mockResolvedValue(null);
      userRepo.save.mockImplementation(async (u) => u);

      const result = await service.update(1, { email: 'new@example.com' });

      expect(userRepo.findByEmailExcludeId).toHaveBeenCalledWith('new@example.com', 1);
      expect(result.email).toBe('new@example.com');
    });

    it('should throw ConflictException when new email already taken', async () => {
      userRepo.findById.mockResolvedValue(mockUser());
      userRepo.findByEmailExcludeId.mockResolvedValue(mockUser({ id: 2 }));

      await expect(
        service.update(1, { email: 'taken@example.com' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when user not found', async () => {
      userRepo.findById.mockResolvedValue(null);

      await expect(service.update(99, { fullName: 'test' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update role and isActive', async () => {
      const user = mockUser();
      userRepo.findById.mockResolvedValue(user);
      userRepo.save.mockImplementation(async (u) => u);

      const result = await service.update(1, {
        role: UserRole.ADMIN,
        isActive: false,
      });

      expect(result.role).toBe(UserRole.ADMIN);
      expect(result.isActive).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete user when found', async () => {
      userRepo.findById.mockResolvedValue(mockUser());

      await service.delete(1);

      expect(userRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when user not found', async () => {
      userRepo.findById.mockResolvedValue(null);

      await expect(service.delete(99)).rejects.toThrow(NotFoundException);
    });
  });
});
