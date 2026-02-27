import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../src/modules/auth/service/auth.service.js';
import { UserRepository } from '../src/modules/user/repository/user.repository.js';
import { User, UserRole } from '../src/modules/user/entity/user.entity.js';

jest.mock('bcrypt');
jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  randomBytes: jest.fn().mockReturnValue({
    toString: jest.fn().mockReturnValue('mock-refresh-token-hex'),
  }),
}));

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: jest.Mocked<UserRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let redis: any;

  const mockUser = (overrides: Partial<User> = {}): User => {
    const u = new User();
    u.id = 1;
    u.fullName = 'Test User';
    u.email = 'test@example.com';
    u.password = '$2b$10$hashedpw';
    u.phone = '0123456789';
    u.role = UserRole.USER;
    u.isActive = true;
    u.createdAt = new Date();
    u.updatedAt = new Date();
    return Object.assign(u, overrides);
  };

  beforeEach(async () => {
    userRepo = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    } as any;

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
      verifyAsync: jest.fn(),
    } as any;

    configService = {
      get: jest.fn().mockReturnValue('test-secret'),
    } as any;

    redis = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      sadd: jest.fn(),
      srem: jest.fn(),
      smembers: jest.fn().mockResolvedValue([]),
      expire: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useValue: userRepo },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        { provide: 'default_IORedisModuleConnectionToken', useValue: redis },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register a new user', async () => {
      userRepo.findByEmail.mockResolvedValue(null);
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashed123');
      userRepo.create.mockResolvedValue(mockUser());

      const result = await service.register({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.fullName).toBe('Test User');
      expect(result.email).toBe('test@example.com');
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(userRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: UserRole.USER }),
      );
    });

    it('should throw ConflictException when email exists', async () => {
      userRepo.findByEmail.mockResolvedValue(mockUser());

      await expect(
        service.register({
          fullName: 'Test',
          email: 'test@example.com',
          password: 'pass',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return tokens on valid credentials', async () => {
      const user = mockUser();
      userRepo.findByEmail.mockResolvedValue(user);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.token).toBe('mock-jwt-token');
      expect(result.refreshToken).toBe('mock-refresh-token-hex');
      expect(redis.set).toHaveBeenCalled();
      expect(redis.sadd).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      userRepo.findByEmail.mockResolvedValue(mockUser());
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      userRepo.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'notexist@example.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      userRepo.findByEmail.mockResolvedValue(mockUser({ isActive: false }));

      await expect(
        service.login({ email: 'test@example.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('should rotate refresh token', async () => {
      redis.get.mockResolvedValue(JSON.stringify({ userId: 1, email: 'test@example.com' }));
      userRepo.findById.mockResolvedValue(mockUser());

      const result = await service.refresh('old-refresh-token');

      expect(redis.del).toHaveBeenCalledWith('refresh_token:old-refresh-token');
      expect(redis.srem).toHaveBeenCalledWith('user_tokens:1', 'old-refresh-token');
      expect(result.token).toBe('mock-jwt-token');
      expect(result.refreshToken).toBe('mock-refresh-token-hex');
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      redis.get.mockResolvedValue(null);

      await expect(service.refresh('invalid')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user inactive after refresh', async () => {
      redis.get.mockResolvedValue(JSON.stringify({ userId: 1 }));
      userRepo.findById.mockResolvedValue(mockUser({ isActive: false }));

      await expect(service.refresh('some-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('introspect', () => {
    it('should return valid: true for valid JWT', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: 1 });

      const result = await service.introspect('valid-token');

      expect(result.valid).toBe(true);
    });

    it('should return valid: false for invalid JWT', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('invalid'));

      const result = await service.introspect('invalid-token');

      expect(result.valid).toBe(false);
    });
  });

  describe('logout', () => {
    it('should delete all refresh tokens for user', async () => {
      redis.smembers.mockResolvedValue(['token1', 'token2']);

      await service.logout(1);

      expect(redis.del).toHaveBeenCalledWith(
        'refresh_token:token1',
        'refresh_token:token2',
      );
      expect(redis.del).toHaveBeenCalledWith('user_tokens:1');
    });

    it('should handle user with no tokens', async () => {
      redis.smembers.mockResolvedValue([]);

      await service.logout(1);

      expect(redis.del).toHaveBeenCalledWith('user_tokens:1');
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      userRepo.findById.mockResolvedValue(mockUser());

      const result = await service.getProfile(1);

      expect(result.id).toBe(1);
      expect(result.fullName).toBe('Test User');
      expect(result.email).toBe('test@example.com');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      userRepo.findById.mockResolvedValue(null);

      await expect(service.getProfile(99)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
