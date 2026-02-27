export interface Login {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
}

export interface LogoutRequest {
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  code: number; // alias for statusCode
  message: string;
  data: T;
  timestamp: string;
}

export interface IntrospectResponse {
  valid: boolean;
}