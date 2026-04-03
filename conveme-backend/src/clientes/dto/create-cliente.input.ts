import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateClienteInput {
  @Field(() => Int, { nullable: true })
  usuario_id?: number;

  @Field()
  nombre_completo: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  telefono?: string;

  @Field({ nullable: true })
  direccion_envio?: string;

}
