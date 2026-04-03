import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreatePedidoInput } from './create-pedido.input';

@InputType()
export class UpdatePedidoInput extends PartialType(CreatePedidoInput) {
    @Field(() => Int)
    id_pedido: number;
}
