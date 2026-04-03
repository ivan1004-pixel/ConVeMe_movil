import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TamanosService } from './tamanos.service';
import { TamanosResolver } from './tamanos.resolver';
import { Tamano } from './tamano.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tamano])],
        providers: [TamanosResolver, TamanosService],
        exports: [TamanosService],
})
export class TamanosModule {}
