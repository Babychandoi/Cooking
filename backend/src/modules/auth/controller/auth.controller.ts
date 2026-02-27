import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from '../service/auth.service.js';
import { RegisterDto } from '../dto/request/register.dto.js';
import { LoginDto } from '../dto/request/login.dto.js';
import { RefreshTokenDto } from '../dto/request/refresh-token.dto.js';
import { IntrospectDto } from '../dto/request/introspect.dto.js';
import { LogoutDto } from '../dto/request/logout.dto.js';
import { ApiResponse } from '../../../common/response/api-response.js';
import { Public } from '../decorator/public.decorator.js';
import { CurrentUser } from '../decorator/current-user.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const data = await this.authService.register(dto);
    return ApiResponse.created(data, 'Đăng ký thành công');
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const data = await this.authService.login(dto);
    return ApiResponse.ok(data, 'Đăng nhập thành công');
  }

  @Public()
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    const data = await this.authService.refresh(dto.refreshToken);
    return ApiResponse.ok(data, 'Refresh token thành công');
  }

  @Public()
  @Post('introspect')
  async introspect(@Body() dto: IntrospectDto) {
    const data = await this.authService.introspect(dto.token);
    return ApiResponse.ok(data);
  }

  @Post('logout')
  async logout(@CurrentUser('id') userId: number) {
    await this.authService.logout(userId);
    return ApiResponse.ok(null, 'Đăng xuất thành công');
  }

  @Get('me')
  async getProfile(@CurrentUser('id') userId: number) {
    const data = await this.authService.getProfile(userId);
    return ApiResponse.ok(data);
  }
}
