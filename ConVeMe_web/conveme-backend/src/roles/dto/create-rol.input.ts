import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateRolInput {
    @Field()
    nombre: string;

    @Field({ nullable: true })
    descripcion?: string;
}
