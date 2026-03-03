import { IsString, IsNotEmpty, IsNumber, MaxLength } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  invoiceId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  method: string; // cash, card, qr

  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
