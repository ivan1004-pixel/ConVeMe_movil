import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateClienteInput } from './create-cliente.input';

@InputType()
export class UpdateClienteInput extends PartialType(CreateClienteInput) {
  @Field(() => Int)
  id_cliente: number;
}