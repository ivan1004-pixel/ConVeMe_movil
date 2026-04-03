import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreatePagoVendedorInput } from './create-pago-vendedor.input';

@InputType()
export class UpdatePagoVendedorInput extends PartialType(CreatePagoVendedorInput) {
    @Field(() => Int)
    id_pago: number;
}
