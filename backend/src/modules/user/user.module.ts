import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity.js';
import { UserRepository } from './repository/user.repository.js';
import { UserService } from './service/user.service.js';
import { UserController } from './controller/user.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserRepository, UserService],
  exports: [UserRepository],
})
export class UserModule {}
