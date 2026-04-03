import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateInventarioProductoInput {
    @Field(() => Int)
    producto_id: number;

    @Field(() => Int, { nullable: true })
    stock_minimo_alerta?: number;
}
