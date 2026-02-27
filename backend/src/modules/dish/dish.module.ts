import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dish } from './entity/dish.entity.js';
import { DishRepository } from './repository/dish.repository.js';
import { DishServiceImpl } from './service/dish.service.impl.js';
import { DishController } from './controller/dish.controller.js';
import { DISH_SERVICE } from './service/dish.service.js';
import { IngredientModule } from '../ingredient/ingredient.module.js';
import { RecipeModule } from '../recipe/recipe.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dish]),
    IngredientModule,
    forwardRef(() => RecipeModule),
  ],
  controllers: [DishController],
  providers: [
    DishRepository,
    {
      provide: DISH_SERVICE,
      useClass: DishServiceImpl,
    },
  ],
  exports: [DishRepository, DISH_SERVICE],
})
export class DishModule {}
