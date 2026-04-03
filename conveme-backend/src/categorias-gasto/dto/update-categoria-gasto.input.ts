import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateCategoriaGastoInput } from './create-categoria-gasto.input';

@InputType()
export class UpdateCategoriaGastoInput extends PartialType(CreateCategoriaGastoInput) {
    @Field(() => Int)
    id_categoria: number;
}
