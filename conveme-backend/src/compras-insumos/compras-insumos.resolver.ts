import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ComprasInsumosService } from './compras-insumos.service';
import { CompraInsumo } from './entities/compra-insumo.entity';
import { CreateCompraInsumoInput } from './dto/create-compra-insumo.input';
import { UpdateCompraInsumoInput } from './dto/update-compra-insumo.input';

@Resolver(() => CompraInsumo)
export class ComprasInsumosResolver {
    constructor(private readonly comprasInsumosService: ComprasInsumosService) {}

    @Mutation(() => CompraInsumo)
    createCompraInsumo(@Args('createCompraInsumoInput') createCompraInsumoInput: CreateCompraInsumoInput) {
        return this.comprasInsumosService.create(createCompraInsumoInput);
    }

    @Query(() => [CompraInsumo], { name: 'comprasInsumos' })
    findAll() {
        return this.comprasInsumosService.findAll();
    }

    @Query(() => CompraInsumo, { name: 'compraInsumo' })
    findOne(@Args('id_compra_insumo', { type: () => Int }) id_compra_insumo: number) {
        return this.comprasInsumosService.findOne(id_compra_insumo);
    }

    @Mutation(() => CompraInsumo)
    updateCompraInsumo(@Args('updateCompraInsumoInput') updateCompraInsumoInput: UpdateCompraInsumoInput) {
        return this.comprasInsumosService.update(updateCompraInsumoInput.id_compra_insumo, updateCompraInsumoInput);
    }

    @Mutation(() => Boolean)
    removeCompraInsumo(@Args('id_compra_insumo', { type: () => Int }) id_compra_insumo: number) {
        return this.comprasInsumosService.remove(id_compra_insumo);
    }
}
