import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductosService } from './productos.service';
import { ProductosResolver } from './productos.resolver';
import { Producto } from './producto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Producto])],
        providers: [ProductosResolver, ProductosService],
        exports: [ProductosService],
})
export class ProductosModule {}
