import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateEmpleadoInput {
    @Field(() => Int)
    usuario_id: number;

    @Field()
    nombre_completo: string;

    @Field()
    email: string;

    @Field({ nullable: true })
    telefono?: string;

    @Field({ nullable: true })
    puesto?: string;

    @Field({ nullable: true })
    calle_y_numero?: string;

    @Field({ nullable: true })
    colonia?: string;

    @Field({ nullable: true })
    codigo_postal?: string;

    @Field(() => Int, { nullable: true })
    municipio_id?: number;
}
