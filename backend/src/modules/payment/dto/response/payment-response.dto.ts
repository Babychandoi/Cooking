export class PaymentResponseDto {
  id: string;
  invoiceId: string;
  method: string;
  amount: number;
  status: string;
  paidAt: Date;
}
