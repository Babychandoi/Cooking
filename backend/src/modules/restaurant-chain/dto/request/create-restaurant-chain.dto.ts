import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateRestaurantChainDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  status?: string;
}
