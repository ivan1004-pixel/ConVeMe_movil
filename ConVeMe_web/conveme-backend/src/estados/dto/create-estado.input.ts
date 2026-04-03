// create-estado.input.ts
import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateEstadoInput {
    @Field(() => Int)
    pais_id: number;

    @Field()
    nombre: string;
}

