import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComprasInsumosService } from './compras-insumos.service';
import { ComprasInsumosResolver } from './compras-insumos.resolver';
import { CompraInsumo } from './entities/compra-insumo.entity';
import { DetCompraInsumo } from './entities/det-compra-insumo.entity';

@Module({
  // Registramos ambas tablas aquí
  imports: [TypeOrmModule.forFeature([CompraInsumo, DetCompraInsumo])],
        providers: [ComprasInsumosResolver, ComprasInsumosService],
        exports: [ComprasInsumosService],
})
export class ComprasInsumosModule {}
