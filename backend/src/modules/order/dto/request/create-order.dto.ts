import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  Min,
  ArrayMinSize,
} from 'class-validator';

export class OrderItemDto {
  @IsNotEmpty()
  @IsNumber()
  dishId: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsNumber()
  tableNumber?: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
