import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrediccionesService } from './predicciones.service';
import { PrediccionesResolver } from './predicciones.resolver';

// Importa las entidades que vamos a leer para predecir
import { CorteVendedor } from '../cortes-vendedor/entities/corte-vendedor.entity';
import { DetAsignacion } from '../asignaciones-vendedor/entities/det-asignacion.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([CorteVendedor, DetAsignacion])
    ],
    providers: [PrediccionesService, PrediccionesResolver],
})
export class PrediccionesModule {}
