import { IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateTableDto {
  @IsNotEmpty()
  @IsString()
  branchId: string;

  @IsNotEmpty()
  @IsString()
  tableCode: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  capacity?: number;
}
