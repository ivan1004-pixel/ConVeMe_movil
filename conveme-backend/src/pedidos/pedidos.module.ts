import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidosService } from './pedidos.service';
import { PedidosResolver } from './pedidos.resolver';
import { Pedido } from './entities/pedido.entity';
import { DetPedido } from './entities/det-pedido.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pedido, DetPedido])],
        providers: [PedidosResolver, PedidosService],
        exports: [PedidosService],
})
export class PedidosModule {}
