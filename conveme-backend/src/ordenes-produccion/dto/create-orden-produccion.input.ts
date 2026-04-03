import { InputType, Field, Int, Float } from '@nestjs/graphql';

@InputType()
export class CreateDetOrdenInput {
    // 👇 IDs opcionales para cuando editamos la orden
    @Field(() => Int, { nullable: true })
    id_det_orden?: number;

    @Field(() => Int, { nullable: true })
    orden_produccion_id?: number;

    @Field(() => Int)
    insumo_id: number;

    @Field(() => Float)
    cantidad_consumida: number;
}

@InputType()
export class CreateOrdenProduccionInput {
    @Field(() => Int)
    producto_id: number;

    @Field(() => Int)
    empleado_id: number;

    @Field(() => Int)
    cantidad_a_producir: number;

    @Field({ nullable: true })
    estado?: string;

    @Field(() => [CreateDetOrdenInput])
    detalles: CreateDetOrdenInput[];
}
