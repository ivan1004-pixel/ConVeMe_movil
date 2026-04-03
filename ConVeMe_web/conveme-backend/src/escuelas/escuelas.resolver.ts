import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { EscuelasService } from './escuelas.service';
import { Escuela } from './escuela.entity';
import { CreateEscuelaInput } from './dto/create-escuela.input';
import { UpdateEscuelaInput } from './dto/update-escuela.input';

@Resolver(() => Escuela)
export class EscuelasResolver {
    constructor(private readonly escuelasService: EscuelasService) {}

    @Mutation(() => Escuela)
    createEscuela(@Args('createEscuelaInput') createEscuelaInput: CreateEscuelaInput) {
        return this.escuelasService.create(createEscuelaInput);
    }

    @Query(() => [Escuela], { name: 'escuelas' })
    findAll() {
        return this.escuelasService.findAll();
    }

    @Query(() => Escuela, { name: 'escuela' })
    findOne(@Args('id_escuela', { type: () => Int }) id_escuela: number) {
        return this.escuelasService.findOne(id_escuela);
    }

    @Mutation(() => Escuela)
    updateEscuela(@Args('updateEscuelaInput') updateEscuelaInput: UpdateEscuelaInput) {
        return this.escuelasService.update(updateEscuelaInput.id_escuela, updateEscuelaInput);
    }

    // 👇 AQUÍ ESTÁ LA MAGIA. Cambiamos Boolean por Escuela
    @Mutation(() => Escuela)
    removeEscuela(@Args('id_escuela', { type: () => Int }) id_escuela: number) {
        return this.escuelasService.remove(id_escuela);
    }
}
