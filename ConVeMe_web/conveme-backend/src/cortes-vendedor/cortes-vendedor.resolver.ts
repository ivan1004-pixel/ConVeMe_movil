import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CortesVendedorService } from './cortes-vendedor.service';
import { CorteVendedor } from './entities/corte-vendedor.entity';
import { CreateCorteVendedorInput } from './dto/create-corte-vendedor.input';
import { UpdateCorteVendedorInput } from './dto/update-corte-vendedor.input';

@Resolver(() => CorteVendedor)
export class CortesVendedorResolver {
    constructor(private readonly cortesVendedorService: CortesVendedorService) {}

    @Mutation(() => CorteVendedor)
    createCorteVendedor(@Args('createCorteVendedorInput') createCorteVendedorInput: CreateCorteVendedorInput) {
        return this.cortesVendedorService.create(createCorteVendedorInput);
    }

    // 👇 Actualizado para recibir la variable de búsqueda
    @Query(() => [CorteVendedor], { name: 'cortesVendedor' })
    findAll(@Args('search', { type: () => String, nullable: true }) search?: string) {
        return this.cortesVendedorService.findAll(search || '');
    }

    // 👇 NUEVO: El endpoint para "Mis Finanzas"
    @Query(() => [CorteVendedor], { name: 'cortesPorVendedor' })
    findByVendedor(@Args('vendedor_id', { type: () => Int }) vendedor_id: number) {
        return this.cortesVendedorService.findByVendedor(vendedor_id);
    }

    @Query(() => CorteVendedor, { name: 'corteVendedor' })
    findOne(@Args('id_corte', { type: () => Int }) id_corte: number) {
        return this.cortesVendedorService.findOne(id_corte);
    }

    @Mutation(() => CorteVendedor)
    updateCorteVendedor(@Args('updateCorteVendedorInput') updateCorteVendedorInput: UpdateCorteVendedorInput) {
        return this.cortesVendedorService.update(updateCorteVendedorInput.id_corte, updateCorteVendedorInput);
    }

    @Mutation(() => Boolean)
    removeCorteVendedor(@Args('id_corte', { type: () => Int }) id_corte: number) {
        return this.cortesVendedorService.remove(id_corte);
    }
}
