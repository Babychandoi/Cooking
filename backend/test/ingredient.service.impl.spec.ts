import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { IngredientServiceImpl } from '../src/modules/ingredient/service/ingredient.service.impl.js';
import { IngredientRepository } from '../src/modules/ingredient/repository/ingredient.repository.js';
import { Ingredient } from '../src/modules/ingredient/entity/ingredient.entity.js';
import { EntityNotFoundException } from '../src/common/exception/exceptions/not-found.exception.js';
import { PaginatedResponse } from '../src/common/response/paginated-response.js';

describe('IngredientServiceImpl', () => {
  let service: IngredientServiceImpl;
  let ingredientRepo: jest.Mocked<IngredientRepository>;
  let dataSource: jest.Mocked<DataSource>;
  let mockQueryBuilder: any;
  let mockRepository: any;

  const mockIngredient = (): Ingredient => {
    const i = new Ingredient();
    i.id = 1;
    i.name = 'Bột mì';
    i.unit = 'kg';
    i.stock = 10;
    i.version = 1;
    return i;
  };

  beforeEach(async () => {
    mockQueryBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(null),
    };

    mockRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    ingredientRepo = {
      findAll: jest.fn(),
      findPaginated: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      getRepository: jest.fn(),
    } as any;

    dataSource = {
      getRepository: jest.fn().mockReturnValue(mockRepository),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngredientServiceImpl,
        { provide: IngredientRepository, useValue: ingredientRepo },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<IngredientServiceImpl>(IngredientServiceImpl);
  });

  describe('findAll', () => {
    it('should return all ingredients as DTOs', async () => {
      const items = [mockIngredient()];
      ingredientRepo.findAll.mockResolvedValue(items);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
      expect(result[0].name).toBe('Bột mì');
      expect(result[0].unit).toBe('kg');
      expect(result[0].stock).toBe(10);
    });
  });

  describe('findPaginated', () => {
    it('should return paginated response', async () => {
      const items = [mockIngredient()];
      ingredientRepo.findPaginated.mockResolvedValue([items, 1]);

      const result = await service.findPaginated(1, 10, 'bột');

      expect(result).toBeInstanceOf(PaginatedResponse);
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
      expect(ingredientRepo.findPaginated).toHaveBeenCalledWith(1, 10, 'bột');
    });

    it('should compute totalPages correctly', async () => {
      ingredientRepo.findPaginated.mockResolvedValue([[mockIngredient()], 25]);

      const result = await service.findPaginated(1, 10);

      expect(result.totalPages).toBe(3);
    });
  });

  describe('findById', () => {
    it('should return ingredient DTO when found', async () => {
      ingredientRepo.findById.mockResolvedValue(mockIngredient());

      const result = await service.findById(1);

      expect(result.id).toBe(1);
      expect(result.name).toBe('Bột mì');
    });

    it('should throw EntityNotFoundException when not found', async () => {
      ingredientRepo.findById.mockResolvedValue(null);

      await expect(service.findById(99)).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return new ingredient', async () => {
      const saved = mockIngredient();
      ingredientRepo.save.mockResolvedValue(saved);

      const result = await service.create({ name: 'Bột mì', unit: 'kg', stock: 10 });

      expect(result.name).toBe('Bột mì');
      expect(ingredientRepo.save).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update ingredient fields', async () => {
      const existing = mockIngredient();
      ingredientRepo.findById.mockResolvedValue(existing);
      ingredientRepo.save.mockImplementation(async (e) => e);

      const result = await service.update(1, { name: 'Bột gạo', stock: 20 });

      expect(result.name).toBe('Bột gạo');
      expect(result.stock).toBe(20);
    });

    it('should throw EntityNotFoundException when ingredient not found', async () => {
      ingredientRepo.findById.mockResolvedValue(null);

      await expect(service.update(99, { name: 'test' })).rejects.toThrow(
        EntityNotFoundException,
      );
    });

    it('should allow unit change when ingredient is not used in active recipes', async () => {
      const existing = mockIngredient();
      ingredientRepo.findById.mockResolvedValue(existing);
      ingredientRepo.save.mockImplementation(async (e) => e);
      mockQueryBuilder.getOne.mockResolvedValue(null);

      const result = await service.update(1, { unit: 'g' });

      expect(result.unit).toBe('g');
    });

    it('should block unit change when used in active recipe', async () => {
      const existing = mockIngredient();
      ingredientRepo.findById.mockResolvedValue(existing);
      // First getOne call (RecipeItem check) returns a result
      mockQueryBuilder.getOne.mockResolvedValueOnce({ id: 1 });

      await expect(service.update(1, { unit: 'g' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should block unit change when used in cancellable order', async () => {
      const existing = mockIngredient();
      ingredientRepo.findById.mockResolvedValue(existing);
      // First getOne (RecipeItem) returns null, second (OrderItemIngredient) returns a result
      mockQueryBuilder.getOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 1 });

      await expect(service.update(1, { unit: 'g' })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('restock', () => {
    it('should add quantity to current stock', async () => {
      const existing = mockIngredient();
      existing.stock = 10;
      ingredientRepo.findById.mockResolvedValue(existing);
      ingredientRepo.save.mockImplementation(async (e) => e);

      const result = await service.restock(1, 5);

      expect(result.stock).toBe(15);
    });

    it('should throw EntityNotFoundException when ingredient not found', async () => {
      ingredientRepo.findById.mockResolvedValue(null);

      await expect(service.restock(99, 5)).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete ingredient when not used', async () => {
      ingredientRepo.findById.mockResolvedValue(mockIngredient());
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await service.delete(1);

      expect(ingredientRepo.remove).toHaveBeenCalledWith(1);
    });

    it('should throw EntityNotFoundException when not found', async () => {
      ingredientRepo.findById.mockResolvedValue(null);

      await expect(service.delete(99)).rejects.toThrow(EntityNotFoundException);
    });

    it('should block delete when used in active recipe', async () => {
      ingredientRepo.findById.mockResolvedValue(mockIngredient());
      mockQueryBuilder.getOne.mockResolvedValueOnce({ id: 1 });

      await expect(service.delete(1)).rejects.toThrow(BadRequestException);
    });

    it('should block delete when used in cancellable order', async () => {
      ingredientRepo.findById.mockResolvedValue(mockIngredient());
      mockQueryBuilder.getOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 1 });

      await expect(service.delete(1)).rejects.toThrow(BadRequestException);
    });
  });
});
