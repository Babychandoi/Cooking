import { IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class UpdateIngredientDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;
}
