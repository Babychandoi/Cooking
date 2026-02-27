import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class RestockIngredientDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  quantity: number;
}
