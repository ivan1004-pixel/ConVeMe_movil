import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { InsumosService } from './insumos.service';
import { Insumo } from './insumo.entity';
import { CreateInsumoInput } from './dto/create-insumo.input';
import { UpdateInsumoInput } from './dto/update-insumo.input';

@Resolver(() => Insumo)
export class InsumosResolver {
    constructor(private readonly insumosService: InsumosService) {}

    @Mutation(() => Insumo)
    createInsumo(@Args('createInsumoInput') createInsumoInput: CreateInsumoInput) {
        return this.insumosService.create(createInsumoInput);
    }

    @Query(() => [Insumo], { name: 'insumos' })
    findAll() {
        return this.insumosService.findAll();
    }

    @Query(() => Insumo, { name: 'insumo' })
    findOne(@Args('id_insumo', { type: () => Int }) id_insumo: number) {
        return this.insumosService.findOne(id_insumo);
    }

    @Mutation(() => Insumo)
    updateInsumo(@Args('updateInsumoInput') updateInsumoInput: UpdateInsumoInput) {
        return this.insumosService.update(updateInsumoInput.id_insumo, updateInsumoInput);
    }

    @Mutation(() => Boolean)
    removeInsumo(@Args('id_insumo', { type: () => Int }) id_insumo: number) {
        return this.insumosService.remove(id_insumo);
    }
}
