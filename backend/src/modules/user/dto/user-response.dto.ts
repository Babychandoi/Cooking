import { UserRole } from '../entity/user.entity.js';

export class UserResponseDto {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
