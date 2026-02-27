import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../user/repository/user.repository.js';
import { User, UserRole } from '../../user/entity/user.entity.js';
import { RegisterDto } from '../dto/request/register.dto.js';
import { LoginDto } from '../dto/request/login.dto.js';
import { LoginResponseDto } from '../dto/response/login-response.dto.js';
import { IntrospectResponseDto } from '../dto/response/introspect-response.dto.js';
import { UserProfileDto } from '../dto/response/user-profile.dto.js';
import { randomBytes } from 'crypto';

const REFRESH_TOKEN_PREFIX = 'refresh_token:';
const USER_TOKENS_PREFIX = 'user_tokens:';
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async register(dto: RegisterDto): Promise<UserProfileDto> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email đã được sử dụng');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.userRepository.create({
      fullName: dto.fullName,
      email: dto.email,
      password: hashedPassword,
      phone: dto.phone || '',
      role: UserRole.USER,
    });

    return this.toProfileDto(user);
  }

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    return this.generateTokens(user);
  }

  async refresh(refreshTokenStr: string): Promise<LoginResponseDto> {
    // Look up refresh token in Redis
    const stored = await this.redis.get(`${REFRESH_TOKEN_PREFIX}${refreshTokenStr}`);
    if (!stored) {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }

    const { userId } = JSON.parse(stored);

    // Revoke the old refresh token
    await this.redis.del(`${REFRESH_TOKEN_PREFIX}${refreshTokenStr}`);
    await this.redis.srem(`${USER_TOKENS_PREFIX}${userId}`, refreshTokenStr);

    const user = await this.userRepository.findById(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Tài khoản không tồn tại hoặc đã bị khóa');
    }

    return this.generateTokens(user);
  }

  async introspect(token: string): Promise<IntrospectResponseDto> {
    try {
      await this.jwtService.verifyAsync(token);
      return { valid: true };
    } catch {
      return { valid: false };
    }
  }

  async logout(userId: number): Promise<void> {
    // Get all refresh tokens for this user and delete them
    const tokens = await this.redis.smembers(`${USER_TOKENS_PREFIX}${userId}`);
    if (tokens.length > 0) {
      const keys = tokens.map((t) => `${REFRESH_TOKEN_PREFIX}${t}`);
      await this.redis.del(...keys);
    }
    await this.redis.del(`${USER_TOKENS_PREFIX}${userId}`);
  }

  async getProfile(userId: number): Promise<UserProfileDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }
    return this.toProfileDto(user);
  }

  // --- Private helpers ---

  private async generateTokens(user: User): Promise<LoginResponseDto> {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const token = this.jwtService.sign(payload);

    // Create refresh token and store in Redis
    const refreshTokenStr = randomBytes(64).toString('hex');
    const data = JSON.stringify({ userId: user.id, email: user.email });

    // Store token -> userId mapping with TTL
    await this.redis.set(
      `${REFRESH_TOKEN_PREFIX}${refreshTokenStr}`,
      data,
      'EX',
      REFRESH_TOKEN_TTL,
    );

    // Track user's tokens (for logout/revoke all)
    await this.redis.sadd(`${USER_TOKENS_PREFIX}${user.id}`, refreshTokenStr);
    await this.redis.expire(`${USER_TOKENS_PREFIX}${user.id}`, REFRESH_TOKEN_TTL);

    return { token, refreshToken: refreshTokenStr };
  }

  private toProfileDto(user: User): UserProfileDto {
    const dto = new UserProfileDto();
    dto.id = user.id;
    dto.fullName = user.fullName;
    dto.email = user.email;
    dto.phone = user.phone || '';
    dto.role = user.role;
    return dto;
  }
}
