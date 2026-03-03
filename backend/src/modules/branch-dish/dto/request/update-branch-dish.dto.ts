import { IsNumber, IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateBranchDishDto {
  @IsNumber()
  @IsOptional()
  price?: number;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  status?: string;
}
