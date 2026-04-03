import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsignacionesVendedorService } from './asignaciones-vendedor.service';
import { AsignacionesVendedorResolver } from './asignaciones-vendedor.resolver';
import { AsignacionVendedor } from './entities/asignacion-vendedor.entity';
import { DetAsignacion } from './entities/det-asignacion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AsignacionVendedor, DetAsignacion])],
        providers: [AsignacionesVendedorResolver, AsignacionesVendedorService],
        exports: [AsignacionesVendedorService],
})
export class AsignacionesVendedorModule {}
