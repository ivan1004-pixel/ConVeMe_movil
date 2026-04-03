import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateInventarioProductoInput } from './create-inventario-producto.input';

@InputType()
export class UpdateInventarioProductoInput extends PartialType(CreateInventarioProductoInput) {
    @Field(() => Int)
    id_inventario: number;

    @Field(() => Int, { nullable: true })
    stock_actual?: number;
}
