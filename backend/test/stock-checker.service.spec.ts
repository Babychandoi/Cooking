import { Test, TestingModule } from '@nestjs/testing';
import { StockCheckerService, StockCheckItem } from '../src/modules/order/service/stock-checker.service.js';
import { IngredientRepository } from '../src/modules/ingredient/repository/ingredient.repository.js';
import { RecipeRepository } from '../src/modules/recipe/repository/recipe.repository.js';
import { Recipe } from '../src/modules/recipe/entity/recipe.entity.js';
import { RecipeItem } from '../src/modules/recipe/entity/recipe-item.entity.js';
import { Ingredient } from '../src/modules/ingredient/entity/ingredient.entity.js';
import { InsufficientStockException } from '../src/common/exception/exceptions/insufficient-stock.exception.js';

describe('StockCheckerService', () => {
  let service: StockCheckerService;
  let ingredientRepo: jest.Mocked<IngredientRepository>;
  let recipeRepo: jest.Mocked<RecipeRepository>;

  const buildRecipe = (
    items: { ingredientId: number; quantity: number; unit: string }[],
  ): Recipe => {
    const r = new Recipe();
    r.id = 1;
    r.dishId = 1;
    r.version = 1;
    r.isActive = true;
    r.items = items.map((it, idx) => {
      const ri = new RecipeItem();
      ri.id = idx + 1;
      ri.ingredientId = it.ingredientId;
      ri.quantity = it.quantity;
      ri.unit = it.unit;
      return ri;
    });
    return r;
  };

  const buildIngredient = (id: number, stock: number): Ingredient => {
    const i = new Ingredient();
    i.id = id;
    i.name = `Ingredient ${id}`;
    i.unit = 'kg';
    i.stock = stock;
    return i;
  };

  beforeEach(async () => {
    ingredientRepo = {
      findById: jest.fn(),
    } as any;

    recipeRepo = {
      findActiveByDishId: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockCheckerService,
        { provide: IngredientRepository, useValue: ingredientRepo },
        { provide: RecipeRepository, useValue: recipeRepo },
      ],
    }).compile();

    service = module.get<StockCheckerService>(StockCheckerService);
  });

  it('should pass when stock is sufficient', async () => {
    const recipe = buildRecipe([{ ingredientId: 1, quantity: 0.5, unit: 'kg' }]);
    recipeRepo.findActiveByDishId.mockResolvedValue(recipe);
    ingredientRepo.findById.mockResolvedValue(buildIngredient(1, 10));

    const items: StockCheckItem[] = [{ dishId: 1, quantity: 2 }];
    const result = await service.checkStock(items);

    expect(result).toBeInstanceOf(Map);
    expect(result.get(1)).toHaveLength(1);
    expect(result.get(1)![0].quantity).toBe(1); // 0.5 * 2
  });

  it('should throw InsufficientStockException when stock is insufficient', async () => {
    const recipe = buildRecipe([{ ingredientId: 1, quantity: 5, unit: 'kg' }]);
    recipeRepo.findActiveByDishId.mockResolvedValue(recipe);
    ingredientRepo.findById.mockResolvedValue(buildIngredient(1, 2)); // only 2kg

    const items: StockCheckItem[] = [{ dishId: 1, quantity: 3 }]; // needs 15kg

    await expect(service.checkStock(items)).rejects.toThrow(
      InsufficientStockException,
    );
  });

  it('should aggregate quantities for same ingredient across dishes', async () => {
    const recipe1 = buildRecipe([{ ingredientId: 1, quantity: 3, unit: 'kg' }]);
    const recipe2 = buildRecipe([{ ingredientId: 1, quantity: 4, unit: 'kg' }]);
    recipe2.id = 2;
    recipe2.dishId = 2;

    recipeRepo.findActiveByDishId
      .mockResolvedValueOnce(recipe1)
      .mockResolvedValueOnce(recipe2);
    ingredientRepo.findById.mockResolvedValue(buildIngredient(1, 5)); // only 5kg

    const items: StockCheckItem[] = [
      { dishId: 1, quantity: 1 }, // needs 3
      { dishId: 2, quantity: 1 }, // needs 4 total = 7 > 5
    ];

    await expect(service.checkStock(items)).rejects.toThrow(
      InsufficientStockException,
    );
  });

  it('should throw Error when no active recipe found for dish', async () => {
    recipeRepo.findActiveByDishId.mockResolvedValue(null);

    const items: StockCheckItem[] = [{ dishId: 99, quantity: 1 }];

    await expect(service.checkStock(items)).rejects.toThrow(
      'No active recipe found for dish 99',
    );
  });
});
