import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CategoriasService } from './categorias.service';
import { Categoria } from './categoria.entity';
import { CreateCategoriaInput } from './dto/create-categoria.input';
import { UpdateCategoriaInput } from './dto/update-categoria.input';

@Resolver(() => Categoria)
export class CategoriasResolver {
    constructor(private readonly categoriasService: CategoriasService) {}

    @Mutation(() => Categoria)
    createCategoria(@Args('createCategoriaInput') createCategoriaInput: CreateCategoriaInput) {
        return this.categoriasService.create(createCategoriaInput);
    }

    @Query(() => [Categoria], { name: 'categorias' })
    findAll() {
        return this.categoriasService.findAll();
    }

    @Query(() => Categoria, { name: 'categoria' })
    findOne(@Args('id_categoria', { type: () => Int }) id_categoria: number) {
        return this.categoriasService.findOne(id_categoria);
    }

    @Mutation(() => Categoria)
    updateCategoria(@Args('updateCategoriaInput') updateCategoriaInput: UpdateCategoriaInput) {
        return this.categoriasService.update(updateCategoriaInput.id_categoria, updateCategoriaInput);
    }

    // 👇 Cambiamos Boolean por Categoria
    @Mutation(() => Categoria)
    removeCategoria(@Args('id_categoria', { type: () => Int }) id_categoria: number) {
        return this.categoriasService.remove(id_categoria);
    }
}
