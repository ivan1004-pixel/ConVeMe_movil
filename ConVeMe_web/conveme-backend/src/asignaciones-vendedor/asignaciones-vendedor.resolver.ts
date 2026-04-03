import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AsignacionesVendedorService } from './asignaciones-vendedor.service';
import { AsignacionVendedor } from './entities/asignacion-vendedor.entity';
import { CreateAsignacionVendedorInput } from './dto/create-asignacion-vendedor.input';
import { UpdateAsignacionVendedorInput } from './dto/update-asignacion-vendedor.input';

@Resolver(() => AsignacionVendedor)
export class AsignacionesVendedorResolver {
    constructor(private readonly asignacionesVendedorService: AsignacionesVendedorService) {}

    @Mutation(() => AsignacionVendedor)
    createAsignacionVendedor(@Args('createAsignacionVendedorInput') createAsignacionVendedorInput: CreateAsignacionVendedorInput) {
        return this.asignacionesVendedorService.create(createAsignacionVendedorInput);
    }

    // 👇 Solo un findAll, limpio y correcto
    @Query(() => [AsignacionVendedor], { name: 'asignacionesVendedor' })
    findAll(@Args('search', { type: () => String, nullable: true }) search?: string) {
        return this.asignacionesVendedorService.findAll(search || '');
    }

    @Query(() => AsignacionVendedor, { name: 'asignacionVendedor' })
    findOne(@Args('id_asignacion', { type: () => Int }) id_asignacion: number) {
        return this.asignacionesVendedorService.findOne(id_asignacion);
    }

    @Mutation(() => AsignacionVendedor)
    updateAsignacionVendedor(@Args('updateAsignacionVendedorInput') updateAsignacionVendedorInput: UpdateAsignacionVendedorInput) {
        return this.asignacionesVendedorService.update(updateAsignacionVendedorInput.id_asignacion, updateAsignacionVendedorInput);
    }

    @Mutation(() => Boolean)
    removeAsignacionVendedor(@Args('id_asignacion', { type: () => Int }) id_asignacion: number) {
        return this.asignacionesVendedorService.remove(id_asignacion);
    }
}
