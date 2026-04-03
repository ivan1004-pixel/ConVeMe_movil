import { InputType, Field, Int, Float } from '@nestjs/graphql';

@InputType()
export class CreateProductoInput {
    @Field()
    sku: string;

    @Field()
    nombre: string;

    @Field(() => Int)
    categoria_id: number;

    @Field(() => Int)
    tamano_id: number; // Enviamos sin la 'ñ' por GraphQL

    @Field(() => Float)
    precio_unitario: number;

    @Field(() => Float, { nullable: true })
    precio_mayoreo?: number;

    @Field(() => Int, { nullable: true })
    cantidad_minima_mayoreo?: number;

    @Field(() => Float, { nullable: true })
    costo_produccion?: number;
}
