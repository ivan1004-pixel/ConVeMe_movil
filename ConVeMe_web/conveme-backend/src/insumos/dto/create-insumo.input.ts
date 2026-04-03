import { InputType, Field, Float } from '@nestjs/graphql';

@InputType()
export class CreateInsumoInput {
    @Field()
    nombre: string;

    @Field({ nullable: true })
    unidad_medida?: string;
    @Field(() => Float, { nullable: true })
    stock_minimo_alerta?: number;
}
