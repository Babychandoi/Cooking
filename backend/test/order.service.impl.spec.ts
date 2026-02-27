import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OrderServiceImpl } from '../src/modules/order/service/order.service.impl.js';
import { OrderRepository } from '../src/modules/order/repository/order.repository.js';
import { DishRepository } from '../src/modules/dish/repository/dish.repository.js';
import { RecipeRepository } from '../src/modules/recipe/repository/recipe.repository.js';
import { StockCheckerService } from '../src/modules/order/service/stock-checker.service.js';
import { OrderCancelService } from '../src/modules/order/service/order-cancel.service.js';
import { Order, OrderStatus } from '../src/modules/order/entity/order.entity.js';
import { Dish } from '../src/modules/dish/entity/dish.entity.js';
import { Recipe } from '../src/modules/recipe/entity/recipe.entity.js';
import { RecipeItem } from '../src/modules/recipe/entity/recipe-item.entity.js';
import { Ingredient } from '../src/modules/ingredient/entity/ingredient.entity.js';
import { EntityNotFoundException } from '../src/common/exception/exceptions/not-found.exception.js';
import { PaginatedResponse } from '../src/common/response/paginated-response.js';

describe('OrderServiceImpl', () => {
  let service: OrderServiceImpl;
  let orderRepo: jest.Mocked<OrderRepository>;
  let dishRepo: jest.Mocked<DishRepository>;
  let recipeRepo: jest.Mocked<RecipeRepository>;
  let stockChecker: jest.Mocked<StockCheckerService>;
  let cancelService: jest.Mocked<OrderCancelService>;
  let dataSource: jest.Mocked<DataSource>;
  let mockQueryRunner: any;

  const mockDish = (): Dish => {
    const d = new Dish();
    d.id = 1;
    d.name = 'Phở bò';
    d.price = 50000;
    d.isAvailable = true;
    return d;
  };

  const mockIngredient = (): Ingredient => {
    const i = new Ingredient();
    i.id = 1;
    i.name = 'Bột mì';
    i.unit = 'kg';
    i.stock = 10;
    return i;
  };

  const mockRecipe = (): Recipe => {
    const r = new Recipe();
    r.id = 1;
    r.dishId = 1;
    r.version = 1;
    r.isActive = true;
    const item = new RecipeItem();
    item.ingredientId = 1;
    item.ingredient = mockIngredient();
    item.quantity = 0.5;
    item.unit = 'kg';
    r.items = [item];
    return r;
  };

  const mockOrder = (overrides: Partial<Order> = {}): Order => {
    const o = new Order();
    o.id = 1;
    o.customerName = 'Khách 1';
    o.tableNumber = 5;
    o.status = OrderStatus.PENDING;
    o.totalPrice = 50000;
    o.note = '';
    o.createdAt = new Date();
    o.items = [];
    return Object.assign(o, overrides);
  };

  beforeEach(async () => {
    mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        findOne: jest.fn().mockResolvedValue(mockIngredient()),
        save: jest.fn().mockImplementation((entity) => {
          if (!entity.id) entity.id = 1;
          return Promise.resolve(entity);
        }),
      },
    };

    orderRepo = {
      findAll: jest.fn(),
      findPaginated: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      getRepository: jest.fn(),
    } as any;

    dishRepo = {
      findById: jest.fn(),
    } as any;

    recipeRepo = {
      findActiveByDishId: jest.fn(),
    } as any;

    stockChecker = {
      checkStock: jest.fn(),
    } as any;

    cancelService = {
      cancel: jest.fn(),
    } as any;

    dataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderServiceImpl,
        { provide: OrderRepository, useValue: orderRepo },
        { provide: DishRepository, useValue: dishRepo },
        { provide: RecipeRepository, useValue: recipeRepo },
        { provide: StockCheckerService, useValue: stockChecker },
        { provide: OrderCancelService, useValue: cancelService },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<OrderServiceImpl>(OrderServiceImpl);
  });

  describe('findAll', () => {
    it('should return all orders as DTOs', async () => {
      orderRepo.findAll.mockResolvedValue([mockOrder()]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].customerName).toBe('Khách 1');
    });
  });

  describe('findPaginated', () => {
    it('should return paginated response', async () => {
      orderRepo.findPaginated.mockResolvedValue([[mockOrder()], 1]);

      const result = await service.findPaginated(1, 10);

      expect(result).toBeInstanceOf(PaginatedResponse);
      expect(result.total).toBe(1);
    });
  });

  describe('findById', () => {
    it('should return order DTO when found', async () => {
      orderRepo.findById.mockResolvedValue(mockOrder());

      const result = await service.findById(1);

      expect(result.id).toBe(1);
    });

    it('should throw EntityNotFoundException when not found', async () => {
      orderRepo.findById.mockResolvedValue(null);

      await expect(service.findById(99)).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('create', () => {
    it('should create order with transaction', async () => {
      stockChecker.checkStock.mockResolvedValue(new Map());
      dishRepo.findById.mockResolvedValue(mockDish());
      recipeRepo.findActiveByDishId.mockResolvedValue(mockRecipe());
      orderRepo.findById.mockResolvedValue(mockOrder());

      const result = await service.create({
        customerName: 'Khách 1',
        tableNumber: 5,
        items: [{ dishId: 1, quantity: 2 }],
      });

      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(result.customerName).toBe('Khách 1');
    });

    it('should rollback transaction on error', async () => {
      stockChecker.checkStock.mockResolvedValue(new Map());
      dishRepo.findById.mockResolvedValue(null); // trigger error

      await expect(
        service.create({
          customerName: 'Test',
          tableNumber: 1,
          items: [{ dishId: 99, quantity: 1 }],
        }),
      ).rejects.toThrow();

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should deduct ingredient stock in transaction', async () => {
      stockChecker.checkStock.mockResolvedValue(new Map());
      dishRepo.findById.mockResolvedValue(mockDish());
      recipeRepo.findActiveByDishId.mockResolvedValue(mockRecipe());
      orderRepo.findById.mockResolvedValue(mockOrder());

      const ingredient = mockIngredient();
      mockQueryRunner.manager.findOne.mockResolvedValue(ingredient);

      await service.create({
        customerName: 'Test',
        tableNumber: 1,
        items: [{ dishId: 1, quantity: 2 }],
      });

      // stock should be deducted: 10 - (0.5 * 2) = 9
      expect(ingredient.stock).toBe(9);
    });
  });

  describe('updateStatus', () => {
    it('should transition PENDING -> CONFIRMED', async () => {
      const order = mockOrder({ status: OrderStatus.PENDING });
      orderRepo.findById.mockResolvedValue(order);
      orderRepo.save.mockResolvedValue(order);

      const result = await service.updateStatus(1, OrderStatus.CONFIRMED);

      expect(result.status).toBe(OrderStatus.CONFIRMED);
    });

    it('should transition CONFIRMED -> PREPARING', async () => {
      const order = mockOrder({ status: OrderStatus.CONFIRMED });
      orderRepo.findById.mockResolvedValue(order);
      orderRepo.save.mockResolvedValue(order);

      const result = await service.updateStatus(1, OrderStatus.PREPARING);

      expect(result.status).toBe(OrderStatus.PREPARING);
    });

    it('should transition PREPARING -> COMPLETED', async () => {
      const order = mockOrder({ status: OrderStatus.PREPARING });
      orderRepo.findById.mockResolvedValue(order);
      orderRepo.save.mockResolvedValue(order);

      const result = await service.updateStatus(1, OrderStatus.COMPLETED);

      expect(result.status).toBe(OrderStatus.COMPLETED);
    });

    it('should throw BadRequestException for invalid transition', async () => {
      const order = mockOrder({ status: OrderStatus.PENDING });
      orderRepo.findById.mockResolvedValue(order);

      await expect(
        service.updateStatus(1, OrderStatus.COMPLETED),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for COMPLETED -> any', async () => {
      const order = mockOrder({ status: OrderStatus.COMPLETED });
      orderRepo.findById.mockResolvedValue(order);

      await expect(
        service.updateStatus(1, OrderStatus.PREPARING),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw EntityNotFoundException when order not found', async () => {
      orderRepo.findById.mockResolvedValue(null);

      await expect(
        service.updateStatus(99, OrderStatus.CONFIRMED),
      ).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('cancel', () => {
    it('should delegate to OrderCancelService', async () => {
      const dto = { id: 1 } as any;
      cancelService.cancel.mockResolvedValue(dto);

      const result = await service.cancel(1, 'lý do');

      expect(cancelService.cancel).toHaveBeenCalledWith(1, 'lý do');
      expect(result).toBe(dto);
    });
  });
});
