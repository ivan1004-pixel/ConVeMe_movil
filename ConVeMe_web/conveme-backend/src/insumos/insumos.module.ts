import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InsumosService } from './insumos.service';
import { InsumosResolver } from './insumos.resolver';
import { Insumo } from './insumo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Insumo])],
        providers: [InsumosResolver, InsumosService],
        exports: [InsumosService],
})
export class InsumosModule {}
