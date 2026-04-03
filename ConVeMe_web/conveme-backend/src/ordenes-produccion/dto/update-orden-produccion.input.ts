import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateOrdenProduccionInput } from './create-orden-produccion.input';

@InputType()
export class UpdateOrdenProduccionInput extends PartialType(CreateOrdenProduccionInput) {
    @Field(() => Int)
    id_orden_produccion: number;
}
