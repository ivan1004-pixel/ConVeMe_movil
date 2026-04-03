import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateCorteVendedorInput } from './create-corte-vendedor.input';

@InputType()
export class UpdateCorteVendedorInput extends PartialType(CreateCorteVendedorInput) {
    @Field(() => Int)
    id_corte: number;
}
