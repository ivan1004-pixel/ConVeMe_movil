import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { GastosOperativosService } from './gastos-operativos.service';
import { GastoOperativo } from './entities/gasto-operativo.entity';
import { CreateGastoOperativoInput } from './dto/create-gasto-operativo.input';
import { UpdateGastoOperativoInput } from './dto/update-gasto-operativo.input';

@Resolver(() => GastoOperativo)
export class GastosOperativosResolver {
    constructor(private readonly gastosOperativosService: GastosOperativosService) {}

    @Mutation(() => GastoOperativo)
    createGastoOperativo(@Args('createGastoOperativoInput') createGastoOperativoInput: CreateGastoOperativoInput) {
        return this.gastosOperativosService.create(createGastoOperativoInput);
    }

    @Query(() => [GastoOperativo], { name: 'gastosOperativos' })
    findAll() {
        return this.gastosOperativosService.findAll();
    }

    @Query(() => GastoOperativo, { name: 'gastoOperativo' })
    findOne(@Args('id_gasto', { type: () => Int }) id_gasto: number) {
        return this.gastosOperativosService.findOne(id_gasto);
    }

    @Mutation(() => GastoOperativo)
    updateGastoOperativo(@Args('updateGastoOperativoInput') updateGastoOperativoInput: UpdateGastoOperativoInput) {
        return this.gastosOperativosService.update(updateGastoOperativoInput.id_gasto, updateGastoOperativoInput);
    }

    @Mutation(() => Boolean)
    removeGastoOperativo(@Args('id_gasto', { type: () => Int }) id_gasto: number) {
        return this.gastosOperativosService.remove(id_gasto);
    }
}
