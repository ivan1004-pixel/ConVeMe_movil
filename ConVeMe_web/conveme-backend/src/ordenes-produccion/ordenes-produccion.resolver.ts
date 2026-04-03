import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { OrdenesProduccionService } from './ordenes-produccion.service';
import { OrdenProduccion } from './entities/orden-produccion.entity';
import { CreateOrdenProduccionInput } from './dto/create-orden-produccion.input';
import { UpdateOrdenProduccionInput } from './dto/update-orden-produccion.input';

@Resolver(() => OrdenProduccion)
export class OrdenesProduccionResolver {
    constructor(private readonly ordenesProduccionService: OrdenesProduccionService) {}

    @Mutation(() => OrdenProduccion)
    createOrdenProduccion(@Args('createOrdenProduccionInput') createOrdenProduccionInput: CreateOrdenProduccionInput) {
        return this.ordenesProduccionService.create(createOrdenProduccionInput);
    }

    @Query(() => [OrdenProduccion], { name: 'ordenesProduccion' })
    findAll() {
        return this.ordenesProduccionService.findAll();
    }

    @Query(() => OrdenProduccion, { name: 'ordenProduccion' })
    findOne(@Args('id_orden_produccion', { type: () => Int }) id_orden_produccion: number) {
        return this.ordenesProduccionService.findOne(id_orden_produccion);
    }

    @Mutation(() => OrdenProduccion)
    updateOrdenProduccion(@Args('updateOrdenProduccionInput') updateOrdenProduccionInput: UpdateOrdenProduccionInput) {
        return this.ordenesProduccionService.update(updateOrdenProduccionInput.id_orden_produccion, updateOrdenProduccionInput);
    }

    @Mutation(() => Boolean)
    removeOrdenProduccion(@Args('id_orden_produccion', { type: () => Int }) id_orden_produccion: number) {
        return this.ordenesProduccionService.remove(id_orden_produccion);
    }
}
