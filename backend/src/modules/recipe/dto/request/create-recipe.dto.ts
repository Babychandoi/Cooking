import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsArray,
  ValidateNested,
  IsString,
  Min,
  ArrayMinSize,
} from 'class-validator';

export class RecipeItemDto {
  @IsNotEmpty()
  @IsNumber()
  ingredientId: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  quantity: number;

  @IsNotEmpty()
  @IsString()
  unit: string;
}

export class CreateRecipeDto {
  @IsNotEmpty()
  @IsNumber()
  dishId: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RecipeItemDto)
  items: RecipeItemDto[];
}
