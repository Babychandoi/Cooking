export class ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  timestamp: string;

  constructor(
    success: boolean,
    statusCode: number,
    message: string,
    data: T | null = null,
  ) {
    this.success = success;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }

  static ok<T>(data: T, message = 'Success'): ApiResponse<T> {
    return new ApiResponse(true, 200, message, data);
  }

  static created<T>(data: T, message = 'Created'): ApiResponse<T> {
    return new ApiResponse(true, 201, message, data);
  }

  static error<T = any>(
    message: string,
    statusCode = 500,
    data: T | null = null,
  ): ApiResponse<T> {
    return new ApiResponse(false, statusCode, message, data);
  }
}
