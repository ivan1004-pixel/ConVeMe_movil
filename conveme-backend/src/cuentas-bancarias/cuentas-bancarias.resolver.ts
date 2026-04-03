import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CuentasBancariasService } from './cuentas-bancarias.service';
import { CuentaBancaria } from './cuenta-bancaria.entity';
import { CreateCuentaBancariaInput } from './dto/create-cuenta-bancaria.input';
import { UpdateCuentaBancariaInput } from './dto/update-cuenta-bancaria.input';

@Resolver(() => CuentaBancaria)
export class CuentasBancariasResolver {
    constructor(private readonly cuentasBancariasService: CuentasBancariasService) {}

    @Mutation(() => CuentaBancaria)
    createCuentaBancaria(@Args('createCuentaBancariaInput') createCuentaBancariaInput: CreateCuentaBancariaInput) {
        return this.cuentasBancariasService.create(createCuentaBancariaInput);
    }

    @Query(() => [CuentaBancaria], { name: 'cuentasBancarias' })
    findAll() {
        return this.cuentasBancariasService.findAll();
    }

    @Query(() => CuentaBancaria, { name: 'cuentaBancaria' })
    findOne(@Args('id_cuenta', { type: () => Int }) id_cuenta: number) {
        return this.cuentasBancariasService.findOne(id_cuenta);
    }

    @Mutation(() => CuentaBancaria)
    updateCuentaBancaria(@Args('updateCuentaBancariaInput') updateCuentaBancariaInput: UpdateCuentaBancariaInput) {
        return this.cuentasBancariasService.update(updateCuentaBancariaInput.id_cuenta, updateCuentaBancariaInput);
    }

    // 👇 Cambiamos Boolean por CuentaBancaria
    @Mutation(() => CuentaBancaria)
    removeCuentaBancaria(@Args('id_cuenta', { type: () => Int }) id_cuenta: number) {
        return this.cuentasBancariasService.remove(id_cuenta);
    }
}
