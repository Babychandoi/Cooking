import { IsString, IsNotEmpty, IsNumber, IsOptional, MaxLength } from 'class-validator';

export class CreateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  tableSessionId: string;

  @IsNumber()
  @IsNotEmpty()
  totalAmount: number;

  @IsNumber()
  @IsOptional()
  discountAmount?: number;

  @IsNumber()
  @IsOptional()
  taxAmount?: number;

  @IsNumber()
  @IsNotEmpty()
  finalAmount: number;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  status?: string;
}
