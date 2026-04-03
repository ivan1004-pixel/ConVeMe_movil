import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { VentasService } from './ventas.service';
import { Venta } from './entities/venta.entity';
import { CreateVentaInput } from './dto/create-venta.input';
import { UpdateVentaInput } from './dto/update-venta.input';

@Resolver(() => Venta)
export class VentasResolver {
    constructor(private readonly ventasService: VentasService) {}

    @Mutation(() => Venta)
    createVenta(@Args('createVentaInput') createVentaInput: CreateVentaInput) {
        return this.ventasService.create(createVentaInput);
    }

    @Query(() => [Venta], { name: 'ventas' })
    findAll() {
        return this.ventasService.findAll();
    }

    @Query(() => Venta, { name: 'venta' })
    findOne(@Args('id_venta', { type: () => Int }) id_venta: number) {
        return this.ventasService.findOne(id_venta);
    }

    @Mutation(() => Venta)
    updateVenta(@Args('updateVentaInput') updateVentaInput: UpdateVentaInput) {
        return this.ventasService.update(updateVentaInput.id_venta, updateVentaInput);
    }

    @Mutation(() => Boolean)
    removeVenta(@Args('id_venta', { type: () => Int }) id_venta: number) {
        return this.ventasService.remove(id_venta);
    }
}
