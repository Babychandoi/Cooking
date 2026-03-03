import { IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class UpdateTableDto {
  @IsOptional()
  @IsString()
  tableCode?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsString()
  status?: string;
}
