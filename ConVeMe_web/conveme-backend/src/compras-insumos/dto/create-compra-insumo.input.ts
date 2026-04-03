import { InputType, Field, Int, Float } from '@nestjs/graphql';

@InputType()
export class CreateDetCompraInput {
    @Field(() => Int)
    insumo_id: number;

    @Field(() => Float)
    cantidad_comprada: number;

    @Field(() => Float, { nullable: true })
    costo_unitario?: number;
}

@InputType()
export class CreateCompraInsumoInput {
    @Field()
    fecha_compra: Date;

    @Field({ nullable: true })
    proveedor?: string;

    @Field(() => Float, { nullable: true })
    monto_total?: number;

    @Field(() => Int, { nullable: true })
    empleado_id?: number;

    @Field({ nullable: true })
    comprobante_url?: string;

    @Field(() => [CreateDetCompraInput])
    detalles: CreateDetCompraInput[];
}
