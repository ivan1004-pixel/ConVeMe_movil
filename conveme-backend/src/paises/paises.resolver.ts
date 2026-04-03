import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PaisesService } from './paises.service';
import { Pais } from './pais.entity';
import { CreatePaisInput } from './dto/create-pais.input';
import { UpdatePaisInput } from './dto/update-pais.input';

@Resolver(() => Pais)
export class PaisesResolver {
    constructor(private readonly paisesService: PaisesService) {}

    @Mutation(() => Pais)
    createPais(@Args('createPaisInput') createPaisInput: CreatePaisInput) {
        return this.paisesService.create(createPaisInput);
    }

    @Query(() => [Pais], { name: 'paises' })
    findAll() {
        return this.paisesService.findAll();
    }

    @Query(() => Pais, { name: 'pais' })
    findOne(@Args('id_pais', { type: () => Int }) id_pais: number) {
        return this.paisesService.findOne(id_pais);
    }

    @Mutation(() => Pais)
    updatePais(@Args('updatePaisInput') updatePaisInput: UpdatePaisInput) {
        return this.paisesService.update(updatePaisInput.id_pais, updatePaisInput);
    }

    @Mutation(() => Boolean)
    removePais(@Args('id_pais', { type: () => Int }) id_pais: number) {
        return this.paisesService.remove(id_pais);
    }
}
