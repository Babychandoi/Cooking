import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis';
import { AuthController } from './controller/auth.controller.js';
import { AuthService } from './service/auth.service.js';
import { JwtStrategy } from './strategy/jwt.strategy.js';
import { UserModule } from '../user/user.module.js';

@Module({
  imports: [
    UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'cooking-secret-key-2026',
        signOptions: {
          expiresIn: (configService.get<string>('JWT_EXPIRES_IN') || '1h') as any,
        },
      }),
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'single' as const,
        url: `redis://${configService.get<string>('redis.host', 'localhost')}:${configService.get<number>('redis.port', 6379)}/${configService.get<number>('redis.db', 0)}`,
        options: {
          password: configService.get<string>('redis.password') || undefined,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
