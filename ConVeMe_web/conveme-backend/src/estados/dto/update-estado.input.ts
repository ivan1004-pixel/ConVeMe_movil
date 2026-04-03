// update-estado.input.ts
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateEstadoInput } from './create-estado.input';

@InputType()
export class UpdateEstadoInput extends PartialType(CreateEstadoInput) {
    @Field(() => Int)
    id_estado: number;
}
