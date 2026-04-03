import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateCuentaBancariaInput } from './create-cuenta-bancaria.input';

@InputType()
export class UpdateCuentaBancariaInput extends PartialType(CreateCuentaBancariaInput) {
    @Field(() => Int)
    id_cuenta: number;

    @Field({ nullable: true })
    activa?: boolean;
}
