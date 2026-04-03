import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreatePaisInput } from './create-pais.input';

@InputType()
export class UpdatePaisInput extends PartialType(CreatePaisInput) {
    @Field(() => Int)
    id_pais: number;
}
