import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { MovimientosInventarioService } from './movimientos-inventario.service';
import { MovimientoInventario } from './movimiento-inventario.entity';
import { CreateMovimientoInventarioInput } from './dto/create-movimiento-inventario.input';
import { UpdateMovimientoInventarioInput } from './dto/update-movimiento-inventario.input';

@Resolver(() => MovimientoInventario)
export class MovimientosInventarioResolver {
    constructor(private readonly movimientosInventarioService: MovimientosInventarioService) {}

    @Mutation(() => MovimientoInventario)
    createMovimientoInventario(@Args('createMovimientoInventarioInput') createMovimientoInventarioInput: CreateMovimientoInventarioInput) {
        return this.movimientosInventarioService.create(createMovimientoInventarioInput);
    }

    @Query(() => [MovimientoInventario], { name: 'movimientosInventario' })
    findAll() {
        return this.movimientosInventarioService.findAll();
    }

    @Query(() => MovimientoInventario, { name: 'movimientoInventario' })
    findOne(@Args('id_movimiento', { type: () => Int }) id_movimiento: number) {
        return this.movimientosInventarioService.findOne(id_movimiento);
    }

    @Mutation(() => MovimientoInventario)
    updateMovimientoInventario(@Args('updateMovimientoInventarioInput') updateMovimientoInventarioInput: UpdateMovimientoInventarioInput) {
        return this.movimientosInventarioService.update(updateMovimientoInventarioInput.id_movimiento, updateMovimientoInventarioInput);
    }

    @Mutation(() => Boolean)
    removeMovimientoInventario(@Args('id_movimiento', { type: () => Int }) id_movimiento: number) {
        return this.movimientosInventarioService.remove(id_movimiento);
    }
}
