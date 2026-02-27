import { UserRole } from '../../../user/entity/user.entity.js';

export class UserProfileDto {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
}
