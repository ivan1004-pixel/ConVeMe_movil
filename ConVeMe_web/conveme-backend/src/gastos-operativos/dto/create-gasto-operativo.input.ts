import { InputType, Field, Int, Float } from '@nestjs/graphql';

@InputType()
export class CreateGastoOperativoInput {
    @Field(() => Int)
    categoria_id: number;

    @Field(() => Int, { nullable: true })
    empleado_id?: number;

    @Field(() => Float)
    monto: number;

    @Field()
    descripcion: string;

    @Field({ nullable: true })
    comprobante_url?: string;
}
