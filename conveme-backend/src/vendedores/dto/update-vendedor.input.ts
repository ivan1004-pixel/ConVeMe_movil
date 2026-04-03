import { InputType, Field, Int, Float, PartialType } from '@nestjs/graphql';
import { CreateVendedorInput } from './create-vendedor.input';

@InputType()
export class UpdateVendedorInput extends PartialType(CreateVendedorInput) {
    @Field(() => Int)
    id_vendedor: number;

    @Field(() => Float, { nullable: true })
    comision_fija_menudeo?: number;

    @Field(() => Float, { nullable: true })
    comision_fija_mayoreo?: number;

    @Field(() => Float, { nullable: true })
    meta_ventas_mensual?: number;
}
