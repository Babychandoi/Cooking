import { BadRequestException } from '@nestjs/common';

export class OrderCancelException extends BadRequestException {
  constructor(message: string) {
    super(message);
  }
}
