import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovimientosInventarioService } from './movimientos-inventario.service';
import { MovimientosInventarioResolver } from './movimientos-inventario.resolver';
import { MovimientoInventario } from './movimiento-inventario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MovimientoInventario])],
        providers: [MovimientosInventarioResolver, MovimientosInventarioService],
        exports: [MovimientosInventarioService],
})
export class MovimientosInventarioModule {}
