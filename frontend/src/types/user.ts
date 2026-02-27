export interface UserResponse {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: 'USER' | 'ADMIN';
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'USER' | 'ADMIN';
}

export interface UpdateUserRequest {
  fullName?: string;
  email?: string;
  password?: string;
  phone?: string;
  role?: 'USER' | 'ADMIN';
  isActive?: boolean;
}