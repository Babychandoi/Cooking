import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantChain } from './entity/restaurant-chain.entity.js';
import { RestaurantChainRepository } from './repository/restaurant-chain.repository.js';
import { RestaurantChainServiceImpl } from './service/restaurant-chain.service.impl.js';
import { RestaurantChainController } from './controller/restaurant-chain.controller.js';
import { RESTAURANT_CHAIN_SERVICE } from './service/restaurant-chain.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([RestaurantChain])],
  controllers: [RestaurantChainController],
  providers: [
    RestaurantChainRepository,
    {
      provide: RESTAURANT_CHAIN_SERVICE,
      useClass: RestaurantChainServiceImpl,
    },
  ],
  exports: [RestaurantChainRepository, RESTAURANT_CHAIN_SERVICE],
})
export class RestaurantChainModule {}
