import { InputType, Field, Int, Float } from '@nestjs/graphql';

@InputType()
export class CreateDetPedidoInput {
    @Field(() => Int)
    producto_id: number;

    @Field(() => Int)
    cantidad: number;

    @Field(() => Float)
    precio_unitario: number;
}

@InputType()
export class CreatePedidoInput {
    @Field(() => Int, { nullable: true })
    cliente_id?: number;

    // 👇 ¡NUEVO! Permitimos recibir el ID del vendedor
    @Field(() => Int, { nullable: true })
    vendedor_id?: number;

    @Field({ nullable: true })
    fecha_entrega_estimada?: Date;

    @Field(() => Float)
    monto_total: number;

    @Field(() => Float, { nullable: true, defaultValue: 0 })
    anticipo?: number;

    @Field({ nullable: true })
    estado?: string;

    @Field(() => [CreateDetPedidoInput])
    detalles: CreateDetPedidoInput[];
}
