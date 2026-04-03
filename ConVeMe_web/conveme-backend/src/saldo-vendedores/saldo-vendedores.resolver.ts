import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { SaldoVendedoresService } from './saldo-vendedores.service';
import { SaldoVendedor } from './saldo-vendedor.entity';
import { CreateSaldoVendedorInput } from './dto/create-saldo-vendedor.input';
import { UpdateSaldoVendedorInput } from './dto/update-saldo-vendedor.input';

@Resolver(() => SaldoVendedor)
export class SaldoVendedoresResolver {
    constructor(private readonly saldoVendedoresService: SaldoVendedoresService) {}

    @Mutation(() => SaldoVendedor)
    createSaldoVendedor(@Args('createSaldoVendedorInput') createSaldoVendedorInput: CreateSaldoVendedorInput) {
        return this.saldoVendedoresService.create(createSaldoVendedorInput);
    }

    @Query(() => [SaldoVendedor], { name: 'saldosVendedores' })
    findAll() {
        return this.saldoVendedoresService.findAll();
    }

    @Query(() => SaldoVendedor, { name: 'saldoVendedor' })
    findOne(@Args('id_saldo', { type: () => Int }) id_saldo: number) {
        return this.saldoVendedoresService.findOne(id_saldo);
    }

    @Mutation(() => SaldoVendedor)
    updateSaldoVendedor(@Args('updateSaldoVendedorInput') updateSaldoVendedorInput: UpdateSaldoVendedorInput) {
        return this.saldoVendedoresService.update(updateSaldoVendedorInput.id_saldo, updateSaldoVendedorInput);
    }

    @Mutation(() => Boolean)
    removeSaldoVendedor(@Args('id_saldo', { type: () => Int }) id_saldo: number) {
        return this.saldoVendedoresService.remove(id_saldo);
    }
}
