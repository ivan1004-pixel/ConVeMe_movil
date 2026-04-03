import { InputType, Field, Int, Float, PartialType } from '@nestjs/graphql';
import { CreateInsumoInput } from './create-insumo.input';

@InputType()
export class UpdateInsumoInput extends PartialType(CreateInsumoInput) {
    @Field(() => Int)
    id_insumo: number;

    @Field(() => Float, { nullable: true })
    stock_actual?: number;
}
