import { Test, TestingModule } from '@nestjs/testing';
import { RecipeServiceImpl } from '../src/modules/recipe/service/recipe.service.impl.js';
import { RecipeRepository } from '../src/modules/recipe/repository/recipe.repository.js';
import { RecipeItemRepository } from '../src/modules/recipe/repository/recipe-item.repository.js';
import { DishRepository } from '../src/modules/dish/repository/dish.repository.js';
import { IngredientRepository } from '../src/modules/ingredient/repository/ingredient.repository.js';
import { Recipe } from '../src/modules/recipe/entity/recipe.entity.js';
import { RecipeItem } from '../src/modules/recipe/entity/recipe-item.entity.js';
import { Dish } from '../src/modules/dish/entity/dish.entity.js';
import { Ingredient } from '../src/modules/ingredient/entity/ingredient.entity.js';
import { EntityNotFoundException } from '../src/common/exception/exceptions/not-found.exception.js';
import { PaginatedResponse } from '../src/common/response/paginated-response.js';

describe('RecipeServiceImpl', () => {
  let service: RecipeServiceImpl;
  let recipeRepo: jest.Mocked<RecipeRepository>;
  let recipeItemRepo: jest.Mocked<RecipeItemRepository>;
  let dishRepo: jest.Mocked<DishRepository>;
  let ingredientRepo: jest.Mocked<IngredientRepository>;

  const mockIngredient = (id = 1): Ingredient => {
    const i = new Ingredient();
    i.id = id;
    i.name = `Nguyên liệu ${id}`;
    i.unit = 'kg';
    i.stock = 10;
    i.version = 1;
    return i;
  };

  const mockDish = (): Dish => {
    const d = new Dish();
    d.id = 1;
    d.name = 'Phở bò';
    d.description = '';
    d.price = 50000;
    d.isAvailable = true;
    return d;
  };

  const mockRecipeItem = (ingredientId = 1): RecipeItem => {
    const ri = new RecipeItem();
    ri.id = 1;
    ri.recipeId = 1;
    ri.ingredientId = ingredientId;
    ri.ingredient = mockIngredient(ingredientId);
    ri.quantity = 0.5;
    ri.unit = 'kg';
    return ri;
  };

  const mockRecipe = (overrides: Partial<Recipe> = {}): Recipe => {
    const r = new Recipe();
    r.id = 1;
    r.dishId = 1;
    r.dish = mockDish();
    r.version = 1;
    r.isActive = true;
    r.createdAt = new Date();
    r.items = [mockRecipeItem()];
    return Object.assign(r, overrides);
  };

  beforeEach(async () => {
    recipeRepo = {
      findAll: jest.fn(),
      findPaginated: jest.fn(),
      findById: jest.fn(),
      findActiveByDishId: jest.fn(),
      findAllByDishId: jest.fn(),
      save: jest.fn(),
      getRepository: jest.fn(),
    } as any;

    recipeItemRepo = {
      findByRecipeId: jest.fn(),
      save: jest.fn(),
      saveMany: jest.fn(),
      removeByRecipeId: jest.fn(),
      remove: jest.fn(),
    } as any;

    dishRepo = {
      findById: jest.fn(),
    } as any;

    ingredientRepo = {
      findById: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipeServiceImpl,
        { provide: RecipeRepository, useValue: recipeRepo },
        { provide: RecipeItemRepository, useValue: recipeItemRepo },
        { provide: DishRepository, useValue: dishRepo },
        { provide: IngredientRepository, useValue: ingredientRepo },
      ],
    }).compile();

    service = module.get<RecipeServiceImpl>(RecipeServiceImpl);
  });

  describe('findAll', () => {
    it('should return all recipes as DTOs', async () => {
      recipeRepo.findAll.mockResolvedValue([mockRecipe()]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].dishName).toBe('Phở bò');
      expect(result[0].version).toBe(1);
    });
  });

  describe('findPaginated', () => {
    it('should return paginated response', async () => {
      recipeRepo.findPaginated.mockResolvedValue([[mockRecipe()], 1]);

      const result = await service.findPaginated(1, 10);

      expect(result).toBeInstanceOf(PaginatedResponse);
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('findById', () => {
    it('should return recipe DTO when found', async () => {
      recipeRepo.findById.mockResolvedValue(mockRecipe());

      const result = await service.findById(1);

      expect(result.id).toBe(1);
      expect(result.items).toHaveLength(1);
    });

    it('should throw EntityNotFoundException when not found', async () => {
      recipeRepo.findById.mockResolvedValue(null);

      await expect(service.findById(99)).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('findActiveByDishId', () => {
    it('should return active recipe for dish', async () => {
      recipeRepo.findActiveByDishId.mockResolvedValue(mockRecipe());

      const result = await service.findActiveByDishId(1);

      expect(result.isActive).toBe(true);
    });

    it('should throw EntityNotFoundException when no active recipe', async () => {
      recipeRepo.findActiveByDishId.mockResolvedValue(null);

      await expect(service.findActiveByDishId(1)).rejects.toThrow(
        EntityNotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create recipe with version 1 when no existing active', async () => {
      dishRepo.findById.mockResolvedValue(mockDish());
      ingredientRepo.findById.mockResolvedValue(mockIngredient());
      recipeRepo.findActiveByDishId.mockResolvedValue(null);
      recipeRepo.save.mockImplementation(async (r) => {
        r.id = 1;
        return r;
      });
      recipeRepo.findById.mockResolvedValue(mockRecipe());

      const result = await service.create({
        dishId: 1,
        items: [{ ingredientId: 1, quantity: 0.5, unit: 'kg' }],
      });

      expect(result.version).toBe(1);
      expect(result.isActive).toBe(true);
    });

    it('should bump version and deactivate existing recipe', async () => {
      const existingActive = mockRecipe({ version: 2 });
      dishRepo.findById.mockResolvedValue(mockDish());
      ingredientRepo.findById.mockResolvedValue(mockIngredient());
      recipeRepo.findActiveByDishId.mockResolvedValue(existingActive);
      recipeRepo.save.mockImplementation(async (r) => {
        r.id = r.id || 2;
        return r;
      });
      recipeRepo.findById.mockResolvedValue(mockRecipe({ id: 2, version: 3 }));

      const result = await service.create({
        dishId: 1,
        items: [{ ingredientId: 1, quantity: 0.5, unit: 'kg' }],
      });

      // Existing should have been deactivated
      expect(existingActive.isActive).toBe(false);
      expect(recipeRepo.save).toHaveBeenCalledTimes(2); // deactivate + new
    });

    it('should throw EntityNotFoundException when dish not found', async () => {
      dishRepo.findById.mockResolvedValue(null);

      await expect(
        service.create({
          dishId: 99,
          items: [{ ingredientId: 1, quantity: 1, unit: 'kg' }],
        }),
      ).rejects.toThrow(EntityNotFoundException);
    });

    it('should throw EntityNotFoundException when ingredient not found', async () => {
      dishRepo.findById.mockResolvedValue(mockDish());
      ingredientRepo.findById.mockResolvedValue(null);

      await expect(
        service.create({
          dishId: 1,
          items: [{ ingredientId: 99, quantity: 1, unit: 'kg' }],
        }),
      ).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('update', () => {
    it('should update recipe items via diff', async () => {
      const existing = mockRecipe();
      recipeRepo.findById.mockResolvedValue(existing);
      dishRepo.findById.mockResolvedValue(mockDish());
      ingredientRepo.findById.mockResolvedValue(mockIngredient(2));
      recipeItemRepo.remove.mockResolvedValue(undefined);
      recipeItemRepo.save.mockResolvedValue(undefined as any);

      // Existing has ingredientId=1; we update with ingredientId=2 (removes 1, adds 2)
      await service.update(1, {
        dishId: 1,
        items: [{ ingredientId: 2, quantity: 1, unit: 'g' }],
      });

      expect(recipeItemRepo.remove).toHaveBeenCalledWith(existing.items[0]);
      expect(recipeItemRepo.save).toHaveBeenCalled();
    });

    it('should throw EntityNotFoundException when recipe not found', async () => {
      recipeRepo.findById.mockResolvedValue(null);

      await expect(
        service.update(99, {
          dishId: 1,
          items: [{ ingredientId: 1, quantity: 1, unit: 'kg' }],
        }),
      ).rejects.toThrow(EntityNotFoundException);
    });

    it('should throw EntityNotFoundException when dish not found on update', async () => {
      recipeRepo.findById.mockResolvedValue(mockRecipe());
      dishRepo.findById.mockResolvedValue(null);

      await expect(
        service.update(1, {
          dishId: 99,
          items: [{ ingredientId: 1, quantity: 1, unit: 'kg' }],
        }),
      ).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('activate', () => {
    it('should activate recipe and deactivate current active', async () => {
      const inactive = mockRecipe({ id: 2, isActive: false, dishId: 1 });
      const currentActive = mockRecipe({ id: 1, isActive: true, dishId: 1 });

      recipeRepo.findById.mockResolvedValue(inactive);
      recipeRepo.findActiveByDishId.mockResolvedValue(currentActive);
      recipeRepo.save.mockImplementation(async (r) => r);

      // After activation, findById returns the now-active recipe
      recipeRepo.findById.mockResolvedValueOnce(inactive);
      recipeRepo.findById.mockResolvedValue(
        mockRecipe({ id: 2, isActive: true }),
      );

      const result = await service.activate(2);

      expect(currentActive.isActive).toBe(false);
      expect(result.isActive).toBe(true);
    });

    it('should return recipe as-is if already active', async () => {
      const active = mockRecipe({ isActive: true });
      recipeRepo.findById.mockResolvedValue(active);

      const result = await service.activate(1);

      expect(result.isActive).toBe(true);
      expect(recipeRepo.save).not.toHaveBeenCalled();
    });

    it('should throw EntityNotFoundException when recipe not found', async () => {
      recipeRepo.findById.mockResolvedValue(null);

      await expect(service.activate(99)).rejects.toThrow(EntityNotFoundException);
    });
  });
});
