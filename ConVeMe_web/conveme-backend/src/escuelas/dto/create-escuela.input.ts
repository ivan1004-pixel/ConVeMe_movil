import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateEscuelaInput {
    @Field()
    nombre: string;

    @Field({ nullable: true })
    siglas?: string;

    @Field(() => Int)
    municipio_id: number;

}
