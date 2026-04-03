import { InputType, Field, Int, Float } from '@nestjs/graphql';

@InputType()
export class CreateDetVentaInput {
    @Field(() => Int)
    producto_id: number;

    @Field(() => Int)
    cantidad: number;

    @Field(() => Float)
    precio_unitario: number;
}

@InputType()
export class CreateVentaInput {
    @Field(() => Int, { nullable: true })
    cliente_id?: number;

    @Field(() => Int, { nullable: true })
    vendedor_id?: number;

    @Field(() => Float)
    monto_total: number;

    @Field({ nullable: true })
    metodo_pago?: string;

    @Field({ nullable: true })
    estado?: string;

    @Field(() => [CreateDetVentaInput])
    detalles: CreateDetVentaInput[];
}
