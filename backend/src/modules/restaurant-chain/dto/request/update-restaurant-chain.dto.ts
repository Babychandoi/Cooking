import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateRestaurantChainDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  status?: string;
}
