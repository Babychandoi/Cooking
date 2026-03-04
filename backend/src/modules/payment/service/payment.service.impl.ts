import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { PaymentService } from './payment.service.js';
import { PaymentRepository } from '../repository/payment.repository.js';
import { PaymentMapper } from '../mapper/payment.mapper.js';
import { PaymentResponseDto } from '../dto/response/payment-response.dto.js';
import { CreatePaymentDto } from '../dto/request/create-payment.dto.js';
import { Payment } from '../entity/payment.entity.js';
import type { InvoiceService } from '../../invoice/service/invoice.service.js';
import { INVOICE_SERVICE } from '../../invoice/service/invoice.service.js';

@Injectable()
export class PaymentServiceImpl implements PaymentService {
  constructor(
    private readonly repository: PaymentRepository,
    @Inject(INVOICE_SERVICE)
    private readonly invoiceService: InvoiceService,
  ) {}

  async findAll(): Promise<PaymentResponseDto[]> {
    const payments = await this.repository.findAll();
    return PaymentMapper.toDtoList(payments);
  }

  async findById(id: string): Promise<PaymentResponseDto> {
    const payment = await this.repository.findById(id);
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return PaymentMapper.toDto(payment);
  }

  async findByInvoice(invoiceId: string): Promise<PaymentResponseDto[]> {
    const payments = await this.repository.findByInvoice(invoiceId);
    return PaymentMapper.toDtoList(payments);
  }

  async create(dto: CreatePaymentDto): Promise<PaymentResponseDto> {
    // Get invoice to check total amount and status
    const invoice = await this.invoiceService.findById(dto.invoiceId);
    
    // Check if invoice is already paid or cancelled
    if (invoice.status === 'paid') {
      throw new BadRequestException('Hóa đơn này đã được thanh toán đủ');
    }
    
    if (invoice.status === 'cancelled') {
      throw new BadRequestException('Không thể thanh toán hóa đơn đã hủy');
    }
    
    // Check if already fully paid
    const allPayments = await this.repository.findByInvoice(dto.invoiceId);
    const totalPaid = allPayments
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + Number(p.amount), 0);
    
    const finalAmount = Number(invoice.finalAmount);
    
    if (totalPaid >= finalAmount) {
      throw new BadRequestException('Hóa đơn này đã được thanh toán đủ');
    }
    
    // Check if payment amount exceeds remaining amount
    const remainingAmount = finalAmount - totalPaid;
    if (dto.amount > remainingAmount) {
      throw new BadRequestException(
        `Số tiền thanh toán vượt quá số tiền còn lại (${remainingAmount.toLocaleString('vi-VN')} đ)`
      );
    }
    
    const payment = new Payment();
    payment.invoiceId = dto.invoiceId;
    payment.method = dto.method;
    payment.amount = dto.amount;
    payment.status = 'COMPLETED'; // Set status to completed

    const saved = await this.repository.save(payment);
    
    // Update total paid after saving
    const newTotalPaid = totalPaid + dto.amount;
    
    // Update invoice status if fully paid
    if (newTotalPaid >= finalAmount) {
      await this.invoiceService.update(dto.invoiceId, { status: 'paid' });
    }
    
    const loaded = await this.repository.findById(saved.id);
    return PaymentMapper.toDto(loaded!);
  }

  async delete(id: string): Promise<void> {
    const payment = await this.repository.findById(id);
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    await this.repository.remove(id);
  }
}
