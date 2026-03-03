import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTableSessionDto {
  @IsNotEmpty()
  @IsString()
  tableId: string;
}
