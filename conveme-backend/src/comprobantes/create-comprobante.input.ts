import { InputType, Field, Int, Float } from '@nestjs/graphql';

@InputType()
export class CreateComprobanteInput {
    @Field(() => Int)
    vendedor_id: number;

    @Field(() => Int)
    admin_id: number;

    @Field(() => Float)
    total_vendido: number;

    @Field(() => Float)
    comision_vendedor: number;

    @Field(() => Float)
    monto_entregado: number;

    @Field(() => Float, { nullable: true, defaultValue: 0 })
    saldo_pendiente?: number;

    @Field({ nullable: true })
    notas?: string;
}
