import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { InventarioProductosService } from './inventario-productos.service';
import { InventarioProducto } from './inventario-producto.entity';
import { CreateInventarioProductoInput } from './dto/create-inventario-producto.input';
import { UpdateInventarioProductoInput } from './dto/update-inventario-producto.input';

@Resolver(() => InventarioProducto)
export class InventarioProductosResolver {
    constructor(private readonly inventarioProductosService: InventarioProductosService) {}

    @Mutation(() => InventarioProducto)
    createInventarioProducto(@Args('createInventarioProductoInput') createInventarioProductoInput: CreateInventarioProductoInput) {
        return this.inventarioProductosService.create(createInventarioProductoInput);
    }

    @Query(() => [InventarioProducto], { name: 'inventariosProductos' })
    findAll() {
        return this.inventarioProductosService.findAll();
    }

    @Query(() => InventarioProducto, { name: 'inventarioProducto' })
    findOne(@Args('id_inventario', { type: () => Int }) id_inventario: number) {
        return this.inventarioProductosService.findOne(id_inventario);
    }

    @Mutation(() => InventarioProducto)
    updateInventarioProducto(@Args('updateInventarioProductoInput') updateInventarioProductoInput: UpdateInventarioProductoInput) {
        return this.inventarioProductosService.update(updateInventarioProductoInput.id_inventario, updateInventarioProductoInput);
    }

    @Mutation(() => Boolean)
    removeInventarioProducto(@Args('id_inventario', { type: () => Int }) id_inventario: number) {
        return this.inventarioProductosService.remove(id_inventario);
    }
}
