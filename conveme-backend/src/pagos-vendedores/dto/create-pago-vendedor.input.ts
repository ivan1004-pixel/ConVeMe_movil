import { InputType, Field, Int, Float } from '@nestjs/graphql';

@InputType()
export class CreatePagoVendedorInput {
    @Field(() => Int)
    vendedor_id: number;

    @Field(() => Float)
    monto_pagado: number;

    @Field()
    metodo_pago: string;

    @Field({ nullable: true })
    referencia_o_comprobante?: string;
}
