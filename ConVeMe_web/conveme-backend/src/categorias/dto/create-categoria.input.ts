import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateCategoriaInput {
    @Field()
    nombre: string;
}
