import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmpleadosService } from './empleados.service';
import { EmpleadosResolver } from './empleados.resolver';
import { Empleado } from './empleado.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Empleado])],
        providers: [EmpleadosResolver, EmpleadosService],
        exports: [EmpleadosService],
})
export class EmpleadosModule {}
