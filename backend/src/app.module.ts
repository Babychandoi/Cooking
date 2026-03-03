import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import appConfig from './config/app.config.js';
import databaseConfig from './config/database.config.js';
import redisConfig from './config/redis.config.js';
import minioConfig from './config/minio.config.js';
import { IngredientModule } from './modules/ingredient/ingredient.module.js';
import { DishModule } from './modules/dish/dish.module.js';
import { RecipeModule } from './modules/recipe/recipe.module.js';
import { OrderModule } from './modules/order/order.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { UserModule } from './modules/user/user.module.js';
import { RestaurantChainModule } from './modules/restaurant-chain/restaurant-chain.module.js';
import { BranchModule } from './modules/branch/branch.module.js';
import { TableModule } from './modules/table/table.module.js';
import { TableSessionModule } from './modules/table-session/table-session.module.js';
import { BranchDishModule } from './modules/branch-dish/branch-dish.module.js';
import { BranchIngredientModule } from './modules/branch-ingredient/branch-ingredient.module.js';
import { InvoiceModule } from './modules/invoice/invoice.module.js';
import { PaymentModule } from './modules/payment/payment.module.js';
import { JwtAuthGuard } from './modules/auth/guard/jwt-auth.guard.js';
import { RolesGuard } from './modules/auth/guard/roles.guard.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig, minioConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        autoLoadEntities: true,
        synchronize: configService.get<boolean>('database.synchronize'),
        logging: configService.get<boolean>('database.logging'),
      }),
    }),
    AuthModule,
    UserModule,
    RestaurantChainModule,
    BranchModule,
    TableModule,
    TableSessionModule,
    IngredientModule,
    DishModule,
    RecipeModule,
    BranchDishModule,
    BranchIngredientModule,
    OrderModule,
    InvoiceModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
