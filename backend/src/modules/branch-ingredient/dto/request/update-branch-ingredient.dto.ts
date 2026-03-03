import { IsNumber, IsOptional } from 'class-validator';

export class UpdateBranchIngredientDto {
  @IsNumber()
  @IsOptional()
  stockQuantity?: number;

  @IsNumber()
  @IsOptional()
  costPrice?: number;
}
