import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateProductoInput } from './create-producto.input';

@InputType()
export class UpdateProductoInput extends PartialType(CreateProductoInput) {
    @Field(() => Int)
    id_producto: number;

    @Field({ nullable: true })
    activo?: boolean; // Para poder desactivar productos sin borrarlos
}
