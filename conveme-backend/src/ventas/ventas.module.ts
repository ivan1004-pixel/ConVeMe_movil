import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VentasService } from './ventas.service';
import { VentasResolver } from './ventas.resolver';
import { Venta } from './entities/venta.entity';
import { DetVenta } from './entities/det-venta.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Venta, DetVenta])],
        providers: [VentasResolver, VentasService],
        exports: [VentasService],
})
export class VentasModule {}
