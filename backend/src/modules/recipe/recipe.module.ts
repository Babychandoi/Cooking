import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recipe } from './entity/recipe.entity.js';
import { RecipeItem } from './entity/recipe-item.entity.js';
import { RecipeRepository } from './repository/recipe.repository.js';
import { RecipeItemRepository } from './repository/recipe-item.repository.js';
import { RecipeServiceImpl } from './service/recipe.service.impl.js';
import { RecipeController } from './controller/recipe.controller.js';
import { RECIPE_SERVICE } from './service/recipe.service.js';
import { DishModule } from '../dish/dish.module.js';
import { IngredientModule } from '../ingredient/ingredient.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Recipe, RecipeItem]),
    forwardRef(() => DishModule),
    IngredientModule,
  ],
  controllers: [RecipeController],
  providers: [
    RecipeRepository,
    RecipeItemRepository,
    {
      provide: RECIPE_SERVICE,
      useClass: RecipeServiceImpl,
    },
  ],
  exports: [RecipeRepository, RecipeItemRepository, RECIPE_SERVICE],
})
export class RecipeModule {}
