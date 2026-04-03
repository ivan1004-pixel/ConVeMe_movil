import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GastosOperativosService } from './gastos-operativos.service';
import { GastosOperativosResolver } from './gastos-operativos.resolver';
import { GastoOperativo } from './entities/gasto-operativo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GastoOperativo])],
        providers: [GastosOperativosResolver, GastosOperativosService],
        exports: [GastosOperativosService],
})
export class GastosOperativosModule {}
