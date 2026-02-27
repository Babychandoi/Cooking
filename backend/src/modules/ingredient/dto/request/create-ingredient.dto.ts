import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';

export class CreateIngredientDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  unit: string;

  @IsNumber()
  @Min(0)
  stock: number;
}
