import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateTamanoInput {
    @Field()
    descripcion: string;
}
