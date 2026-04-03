import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateMovimientoInventarioInput } from './create-movimiento-inventario.input';

@InputType()
export class UpdateMovimientoInventarioInput extends PartialType(CreateMovimientoInventarioInput) {
    @Field(() => Int)
    id_movimiento: number;
}
