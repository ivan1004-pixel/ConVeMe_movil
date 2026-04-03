import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateMovimientoInventarioInput {
    @Field(() => Int)
    producto_id: number;

    @Field()
    tipo_movimiento: string;

    @Field(() => Int)
    cantidad: number;

    @Field()
    motivo: string;

    @Field(() => Int, { nullable: true })
    empleado_id?: number;
}
