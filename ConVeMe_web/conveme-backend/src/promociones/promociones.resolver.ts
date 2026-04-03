import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PromocionesService } from './promociones.service';
import { Promocion } from './promocion.entity';
import { CreatePromocionInput } from './dto/create-promocion.input';
import { UpdatePromocionInput } from './dto/update-promocion.input';

@Resolver(() => Promocion)
export class PromocionesResolver {
    constructor(private readonly promocionesService: PromocionesService) {}

    @Mutation(() => Promocion)
    createPromocion(@Args('createPromocionInput') createPromocionInput: CreatePromocionInput) {
        return this.promocionesService.create(createPromocionInput);
    }

    @Query(() => [Promocion], { name: 'promociones' })
    findAll() {
        return this.promocionesService.findAll();
    }

    @Query(() => Promocion, { name: 'promocion' })
    findOne(@Args('id_promocion', { type: () => Int }) id_promocion: number) {
        return this.promocionesService.findOne(id_promocion);
    }

    @Mutation(() => Promocion)
    updatePromocion(@Args('updatePromocionInput') updatePromocionInput: UpdatePromocionInput) {
        return this.promocionesService.update(updatePromocionInput.id_promocion, updatePromocionInput);
    }

    @Mutation(() => Boolean)
    removePromocion(@Args('id_promocion', { type: () => Int }) id_promocion: number) {
        return this.promocionesService.remove(id_promocion);
    }
}
