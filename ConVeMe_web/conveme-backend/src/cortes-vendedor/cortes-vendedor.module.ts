import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CortesVendedorService } from './cortes-vendedor.service';
import { CortesVendedorResolver } from './cortes-vendedor.resolver';
import { CorteVendedor } from './entities/corte-vendedor.entity';
import { DetCorteInventario } from './entities/det-corte-inventario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CorteVendedor, DetCorteInventario])],
        providers: [CortesVendedorResolver, CortesVendedorService],
        exports: [CortesVendedorService],
})
export class CortesVendedorModule {}
