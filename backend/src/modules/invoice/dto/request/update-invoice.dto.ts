import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateInvoiceDto {
  @IsNumber()
  @IsOptional()
  totalAmount?: number;

  @IsNumber()
  @IsOptional()
  discountAmount?: number;

  @IsNumber()
  @IsOptional()
  taxAmount?: number;

  @IsNumber()
  @IsOptional()
  finalAmount?: number;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  status?: string;
}
