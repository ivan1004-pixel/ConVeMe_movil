import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateCompraInsumoInput } from './create-compra-insumo.input';

@InputType()
export class UpdateCompraInsumoInput extends PartialType(CreateCompraInsumoInput) {
    @Field(() => Int)
    id_compra_insumo: number;
}
