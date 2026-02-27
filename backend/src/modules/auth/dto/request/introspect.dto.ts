import { IsNotEmpty, IsString } from 'class-validator';

export class IntrospectDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
