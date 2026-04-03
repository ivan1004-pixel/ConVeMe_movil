import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaldoVendedoresService } from './saldo-vendedores.service';
import { SaldoVendedoresResolver } from './saldo-vendedores.resolver';
import { SaldoVendedor } from './saldo-vendedor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SaldoVendedor])],
        providers: [SaldoVendedoresResolver, SaldoVendedoresService],
        exports: [SaldoVendedoresService],
})
export class SaldoVendedoresModule {}
