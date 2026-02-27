import { BadRequestException } from '@nestjs/common';

export interface InsufficientItem {
  name: string;
  required: number;
  available: number;
  shortage: number;
}

export class InsufficientStockException extends BadRequestException {
  public readonly items: InsufficientItem[];

  constructor(items: InsufficientItem[]) {
    super({
      message: 'Insufficient stock for one or more ingredients',
      items,
    });
    this.items = items;
  }
}
