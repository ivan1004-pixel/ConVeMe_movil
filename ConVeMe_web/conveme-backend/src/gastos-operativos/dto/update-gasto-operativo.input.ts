import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateGastoOperativoInput } from './create-gasto-operativo.input';

@InputType()
export class UpdateGastoOperativoInput extends PartialType(CreateGastoOperativoInput) {
    @Field(() => Int)
    id_gasto: number;
}
