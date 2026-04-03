import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateAsignacionVendedorInput } from './create-asignacion-vendedor.input';

@InputType()
export class UpdateAsignacionVendedorInput extends PartialType(CreateAsignacionVendedorInput) {
    @Field(() => Int)
    id_asignacion: number;
}
