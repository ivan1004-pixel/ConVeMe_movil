import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CategoriasGastoService } from './categorias-gasto.service';
import { CategoriaGasto } from './entities/categoria-gasto.entity';
import { CreateCategoriaGastoInput } from './dto/create-categoria-gasto.input';
import { UpdateCategoriaGastoInput } from './dto/update-categoria-gasto.input';

@Resolver(() => CategoriaGasto)
export class CategoriasGastoResolver {
    constructor(private readonly categoriasGastoService: CategoriasGastoService) {}

    @Mutation(() => CategoriaGasto)
    createCategoriaGasto(@Args('createCategoriaGastoInput') createCategoriaGastoInput: CreateCategoriaGastoInput) {
        return this.categoriasGastoService.create(createCategoriaGastoInput);
    }

    @Query(() => [CategoriaGasto], { name: 'categoriasGasto' })
    findAll() {
        return this.categoriasGastoService.findAll();
    }

    @Query(() => CategoriaGasto, { name: 'categoriaGasto' })
    findOne(@Args('id_categoria', { type: () => Int }) id_categoria: number) {
        return this.categoriasGastoService.findOne(id_categoria);
    }

    @Mutation(() => CategoriaGasto)
    updateCategoriaGasto(@Args('updateCategoriaGastoInput') updateCategoriaGastoInput: UpdateCategoriaGastoInput) {
        return this.categoriasGastoService.update(updateCategoriaGastoInput.id_categoria, updateCategoriaGastoInput);
    }

    @Mutation(() => Boolean)
    removeCategoriaGasto(@Args('id_categoria', { type: () => Int }) id_categoria: number) {
        return this.categoriasGastoService.remove(id_categoria);
    }
}
