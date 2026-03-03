import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional, MaxLength } from 'class-validator';

export class CreateBranchDishDto {
  @IsString()
  @IsNotEmpty()
  branchId: string;

  @IsString()
  @IsNotEmpty()
  dishId: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  status?: string;
}
