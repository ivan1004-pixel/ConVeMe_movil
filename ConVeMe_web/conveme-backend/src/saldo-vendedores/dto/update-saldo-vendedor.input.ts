import { InputType, Field, Int, Float, PartialType } from '@nestjs/graphql';
import { CreateSaldoVendedorInput } from './create-saldo-vendedor.input';

@InputType()
export class UpdateSaldoVendedorInput extends PartialType(CreateSaldoVendedorInput) {
    @Field(() => Int)
    id_saldo: number;
}
