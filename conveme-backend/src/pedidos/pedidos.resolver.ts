import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PedidosService } from './pedidos.service';
import { Pedido } from './entities/pedido.entity';
import { CreatePedidoInput } from './dto/create-pedido.input';
import { UpdatePedidoInput } from './dto/update-pedido.input';

@Resolver(() => Pedido)
export class PedidosResolver {
    constructor(private readonly pedidosService: PedidosService) {}

    @Mutation(() => Pedido)
    createPedido(@Args('createPedidoInput') createPedidoInput: CreatePedidoInput) {
        return this.pedidosService.create(createPedidoInput);
    }

    @Query(() => [Pedido], { name: 'pedidos' })
    findAll() {
        return this.pedidosService.findAll();
    }

    @Query(() => Pedido, { name: 'pedido' })
    findOne(@Args('id_pedido', { type: () => Int }) id_pedido: number) {
        return this.pedidosService.findOne(id_pedido);
    }

    @Mutation(() => Pedido)
    updatePedido(@Args('updatePedidoInput') updatePedidoInput: UpdatePedidoInput) {
        return this.pedidosService.update(updatePedidoInput.id_pedido, updatePedidoInput);
    }

    @Mutation(() => Boolean)
    removePedido(@Args('id_pedido', { type: () => Int }) id_pedido: number) {
        return this.pedidosService.remove(id_pedido);
    }
}
