import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateMunicipioInput } from './create-municipio.input';

@InputType()
export class UpdateMunicipioInput extends PartialType(CreateMunicipioInput) {
    @Field(() => Int)
    id_municipio: number;
}
