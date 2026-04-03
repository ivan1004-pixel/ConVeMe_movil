import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CuentasBancariasService } from './cuentas-bancarias.service';
import { CuentasBancariasResolver } from './cuentas-bancarias.resolver';
import { CuentaBancaria } from './cuenta-bancaria.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CuentaBancaria])],
        providers: [CuentasBancariasResolver, CuentasBancariasService],
        exports: [CuentasBancariasService],
})
export class CuentasBancariasModule {}
