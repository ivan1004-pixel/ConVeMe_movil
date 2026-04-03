import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateCuentaBancariaInput {
    @Field(() => Int)
    vendedor_id: number;

    @Field()
    banco: string;

    @Field()
    titular_cuenta: string;

    @Field()
    numero_cuenta: string;

    @Field({ nullable: true })
    clabe_interbancaria?: string;
}
