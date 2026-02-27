import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { DishServiceImpl } from '../src/modules/dish/service/dish.service.impl.js';
import { DishRepository } from '../src/modules/dish/repository/dish.repository.js';
import { RecipeRepository } from '../src/modules/recipe/repository/recipe.repository.js';
import { Dish } from '../src/modules/dish/entity/dish.entity.js';
import { EntityNotFoundException } from '../src/common/exception/exceptions/not-found.exception.js';
import { PaginatedResponse } from '../src/common/response/paginated-response.js';

describe('DishServiceImpl', () => {
  let service: DishServiceImpl;
  let dishRepo: jest.Mocked<DishRepository>;
  let recipeRepo: jest.Mocked<RecipeRepository>;

  const mockDish = (overrides: Partial<Dish> = {}): Dish => {
    const d = new Dish();
    d.id = 1;
    d.name = 'Phở bò';
    d.description = 'Phở bò truyền thống';
    d.price = 50000;
    d.isAvailable = false;
    return Object.assign(d, overrides);
  };

  beforeEach(async () => {
    dishRepo = {
      findAll: jest.fn(),
      findPaginated: jest.fn(),
      findById: jest.fn(),
      findAvailable: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    } as any;

    recipeRepo = {
      findActiveByDishId: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DishServiceImpl,
        { provide: DishRepository, useValue: dishRepo },
        { provide: RecipeRepository, useValue: recipeRepo },
      ],
    }).compile();

    service = module.get<DishServiceImpl>(DishServiceImpl);
  });

  describe('findAll', () => {
    it('should return all dishes as DTOs', async () => {
      dishRepo.findAll.mockResolvedValue([mockDish()]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Phở bò');
      expect(result[0].price).toBe(50000);
    });
  });

  describe('findPaginated', () => {
    it('should return paginated response', async () => {
      dishRepo.findPaginated.mockResolvedValue([[mockDish()], 1]);

      const result = await service.findPaginated(1, 10, 'phở');

      expect(result).toBeInstanceOf(PaginatedResponse);
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });
  });

  describe('findById', () => {
    it('should return dish DTO when found', async () => {
      dishRepo.findById.mockResolvedValue(mockDish());

      const result = await service.findById(1);

      expect(result.id).toBe(1);
      expect(result.name).toBe('Phở bò');
    });

    it('should throw EntityNotFoundException when not found', async () => {
      dishRepo.findById.mockResolvedValue(null);

      await expect(service.findById(99)).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('create', () => {
    it('should create dish with isAvailable = false', async () => {
      dishRepo.save.mockImplementation(async (d) => d);

      const result = await service.create({
        name: 'Phở bò',
        price: 50000,
        description: 'Mô tả',
      });

      expect(result.isAvailable).toBe(false);
      expect(result.name).toBe('Phở bò');
    });

    it('should set description to empty string when not provided', async () => {
      dishRepo.save.mockImplementation(async (d) => d);

      const result = await service.create({ name: 'Bún chả', price: 40000 });

      expect(result.description).toBe('');
    });
  });

  describe('update', () => {
    it('should update dish fields', async () => {
      dishRepo.findById.mockResolvedValue(mockDish());
      dishRepo.save.mockImplementation(async (d) => d);

      const result = await service.update(1, { name: 'Phở gà', price: 55000 });

      expect(result.name).toBe('Phở gà');
      expect(result.price).toBe(55000);
    });

    it('should throw EntityNotFoundException when dish not found', async () => {
      dishRepo.findById.mockResolvedValue(null);

      await expect(service.update(99, { name: 'test' })).rejects.toThrow(
        EntityNotFoundException,
      );
    });

    it('should allow setting isAvailable = true when active recipe exists', async () => {
      dishRepo.findById.mockResolvedValue(mockDish());
      recipeRepo.findActiveByDishId.mockResolvedValue({ id: 1 } as any);
      dishRepo.save.mockImplementation(async (d) => d);

      const result = await service.update(1, { isAvailable: true });

      expect(result.isAvailable).toBe(true);
    });

    it('should block isAvailable = true when no active recipe', async () => {
      dishRepo.findById.mockResolvedValue(mockDish());
      recipeRepo.findActiveByDishId.mockResolvedValue(null);

      await expect(
        service.update(1, { isAvailable: true }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow setting isAvailable = false without recipe check', async () => {
      dishRepo.findById.mockResolvedValue(mockDish({ isAvailable: true }));
      dishRepo.save.mockImplementation(async (d) => d);

      const result = await service.update(1, { isAvailable: false });

      expect(result.isAvailable).toBe(false);
      expect(recipeRepo.findActiveByDishId).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete dish when found', async () => {
      dishRepo.findById.mockResolvedValue(mockDish());

      await service.delete(1);

      expect(dishRepo.remove).toHaveBeenCalledWith(1);
    });

    it('should throw EntityNotFoundException when not found', async () => {
      dishRepo.findById.mockResolvedValue(null);

      await expect(service.delete(99)).rejects.toThrow(EntityNotFoundException);
    });
  });
});
