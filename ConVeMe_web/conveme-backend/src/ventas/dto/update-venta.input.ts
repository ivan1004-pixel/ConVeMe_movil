import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateVentaInput } from './create-venta.input';

@InputType()
export class UpdateVentaInput extends PartialType(CreateVentaInput) {
    @Field(() => Int)
    id_venta: number;
}
