import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  Min,
} from 'class-validator';

export class UpdateDishDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
