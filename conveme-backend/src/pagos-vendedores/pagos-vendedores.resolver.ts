import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PagosVendedoresService } from './pagos-vendedores.service';
import { PagoVendedor } from './pago-vendedor.entity';
import { CreatePagoVendedorInput } from './dto/create-pago-vendedor.input';
import { UpdatePagoVendedorInput } from './dto/update-pago-vendedor.input';

@Resolver(() => PagoVendedor)
export class PagosVendedoresResolver {
    constructor(private readonly pagosVendedoresService: PagosVendedoresService) {}

    @Mutation(() => PagoVendedor)
    createPagoVendedor(@Args('createPagoVendedorInput') createPagoVendedorInput: CreatePagoVendedorInput) {
        return this.pagosVendedoresService.create(createPagoVendedorInput);
    }

    @Query(() => [PagoVendedor], { name: 'pagosVendedores' })
    findAll() {
        return this.pagosVendedoresService.findAll();
    }

    @Query(() => PagoVendedor, { name: 'pagoVendedor' })
    findOne(@Args('id_pago', { type: () => Int }) id_pago: number) {
        return this.pagosVendedoresService.findOne(id_pago);
    }

    @Mutation(() => PagoVendedor)
    updatePagoVendedor(@Args('updatePagoVendedorInput') updatePagoVendedorInput: UpdatePagoVendedorInput) {
        return this.pagosVendedoresService.update(updatePagoVendedorInput.id_pago, updatePagoVendedorInput);
    }

    @Mutation(() => Boolean)
    removePagoVendedor(@Args('id_pago', { type: () => Int }) id_pago: number) {
        return this.pagosVendedoresService.remove(id_pago);
    }
}
