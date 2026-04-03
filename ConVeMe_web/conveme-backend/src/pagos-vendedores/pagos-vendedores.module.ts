import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagosVendedoresService } from './pagos-vendedores.service';
import { PagosVendedoresResolver } from './pagos-vendedores.resolver';
import { PagoVendedor } from './pago-vendedor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PagoVendedor])],
        providers: [PagosVendedoresResolver, PagosVendedoresService],
        exports: [PagosVendedoresService],
})
export class PagosVendedoresModule {}
