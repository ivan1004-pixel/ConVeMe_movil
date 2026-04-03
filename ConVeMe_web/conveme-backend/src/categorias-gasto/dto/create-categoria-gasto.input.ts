import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateCategoriaGastoInput {
    @Field()
    nombre: string;

    @Field({ nullable: true })
    descripcion?: string;

    @Field({ nullable: true })
    activa?: boolean;
}
