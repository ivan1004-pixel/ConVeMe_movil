import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdenesProduccionService } from './ordenes-produccion.service';
import { OrdenesProduccionResolver } from './ordenes-produccion.resolver';
import { OrdenProduccion } from './entities/orden-produccion.entity';
import { DetOrdenProduccion } from './entities/det-orden-produccion.entity';

// Importar las Entidades externas para poder inyectarlas
import { Insumo } from '../insumos/insumo.entity';
import { InventarioProducto } from '../inventario-productos/inventario-producto.entity'; // Ajusta la ruta a tu entidad de inventario

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrdenProduccion,
      DetOrdenProduccion,
      Insumo, // Para restar materiales
      InventarioProducto // Para sumar productos terminados
    ])
  ],
  providers: [OrdenesProduccionResolver, OrdenesProduccionService],
  exports: [OrdenesProduccionService],
})
export class OrdenesProduccionModule {}
