import { InputType, Field, Int, Float } from '@nestjs/graphql';

@InputType()
export class CreateSaldoVendedorInput {
    @Field(() => Int)
    vendedor_id: number;

    // Si no le mandamos nada, empieza su cartera en $0.00
    @Field(() => Float, { nullable: true })
    saldo_actual?: number;
}
