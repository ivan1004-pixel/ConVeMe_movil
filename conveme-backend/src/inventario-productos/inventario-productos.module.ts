import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventarioProductosService } from './inventario-productos.service';
import { InventarioProductosResolver } from './inventario-productos.resolver';
import { InventarioProducto } from './inventario-producto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InventarioProducto])],
        providers: [InventarioProductosResolver, InventarioProductosService],
        exports: [InventarioProductosService],
})
export class InventarioProductosModule {}
