import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { PaisesModule } from './paises/paises.module';
import { EstadosModule } from './estados/estados.module';
import { MunicipiosModule } from './municipios/municipios.module';
import { RolesModule } from './roles/roles.module';
import { EscuelasModule } from './escuelas/escuelas.module';
import { EmpleadosModule } from './empleados/empleados.module';
import { VendedoresModule } from './vendedores/vendedores.module';
import { ClientesModule } from './clientes/clientes.module';
import { CategoriasModule } from './categorias/categorias.module';
import { TamanosModule } from './tamanos/tamanos.module';
import { ProductosModule } from './productos/productos.module';
import { InsumosModule } from './insumos/insumos.module';
import { ComprasInsumosModule } from './compras-insumos/compras-insumos.module';
import { OrdenesProduccionModule } from './ordenes-produccion/ordenes-produccion.module';
import { InventarioProductosModule } from './inventario-productos/inventario-productos.module';
import { MovimientosInventarioModule } from './movimientos-inventario/movimientos-inventario.module';
import { AsignacionesVendedorModule } from './asignaciones-vendedor/asignaciones-vendedor.module';
import { CortesVendedorModule } from './cortes-vendedor/cortes-vendedor.module';
import { CuentasBancariasModule } from './cuentas-bancarias/cuentas-bancarias.module';
import { SaldoVendedoresModule } from './saldo-vendedores/saldo-vendedores.module';
import { PagosVendedoresModule } from './pagos-vendedores/pagos-vendedores.module';
import { EventosModule } from './eventos/eventos.module';
import { PromocionesModule } from './promociones/promociones.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { VentasModule } from './ventas/ventas.module';
import { CategoriasGastoModule } from './categorias-gasto/categorias-gasto.module';
import { GastosOperativosModule } from './gastos-operativos/gastos-operativos.module';
import { BitacoraAuditoriaModule } from './bitacora-auditoria/bitacora-auditoria.module';
import { PrediccionesModule } from './predicciones/predicciones.module';
import { ComprobantesModule } from './comprobantes/comprobantes.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true,
    }),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'db.utvt.cloud',
      port: 3306,
      username: 'conveme',
      password: 'bs$QIq4ngOjY',
      database: 'db_conveme',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    UsuariosModule,
    AuthModule,
    PaisesModule,
    EstadosModule,
    MunicipiosModule,
    RolesModule,
    EscuelasModule,
    EmpleadosModule,
    VendedoresModule,
    ClientesModule,
    CategoriasModule,
    TamanosModule,
    ProductosModule,
    InsumosModule,
    ComprasInsumosModule,
    OrdenesProduccionModule,
    InventarioProductosModule,
    MovimientosInventarioModule,
    AsignacionesVendedorModule,
    CortesVendedorModule,
    CuentasBancariasModule,
    SaldoVendedoresModule,
    PagosVendedoresModule,
    EventosModule,
    PromocionesModule,
    PedidosModule,
    VentasModule,
    CategoriasGastoModule,
    GastosOperativosModule,
    BitacoraAuditoriaModule,
    PrediccionesModule,
    ComprobantesModule,
  ],
})
export class AppModule {}
