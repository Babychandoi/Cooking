import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ingredient } from './entity/ingredient.entity.js';
import { IngredientRepository } from './repository/ingredient.repository.js';
import { IngredientServiceImpl } from './service/ingredient.service.impl.js';
import { IngredientController } from './controller/ingredient.controller.js';
import { INGREDIENT_SERVICE } from './service/ingredient.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Ingredient])],
  controllers: [IngredientController],
  providers: [
    IngredientRepository,
    {
      provide: INGREDIENT_SERVICE,
      useClass: IngredientServiceImpl,
    },
  ],
  exports: [IngredientRepository, INGREDIENT_SERVICE],
})
export class IngredientModule {}
