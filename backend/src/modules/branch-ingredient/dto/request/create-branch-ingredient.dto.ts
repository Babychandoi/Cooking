import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateBranchIngredientDto {
  @IsString()
  @IsNotEmpty()
  branchId: string;

  @IsString()
  @IsNotEmpty()
  ingredientId: string;

  @IsNumber()
  @IsOptional()
  stockQuantity?: number;

  @IsNumber()
  @IsOptional()
  costPrice?: number;
}
