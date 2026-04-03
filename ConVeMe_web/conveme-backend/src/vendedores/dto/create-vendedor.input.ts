import { InputType, Int, Float, Field } from '@nestjs/graphql';

@InputType()
export class CreateVendedorInput {
    @Field(() => Int)
    usuario_id: number;

    @Field(() => Int, { nullable: true })
    escuela_id?: number;

    @Field()
    nombre_completo: string;

    @Field()
    email: string;

    @Field({ nullable: true })
    telefono?: string;

    @Field({ nullable: true })
    instagram_handle?: string;

    @Field({ nullable: true })
    calle_y_numero?: string;

    @Field({ nullable: true })
    colonia?: string;

    @Field({ nullable: true })
    codigo_postal?: string;

    @Field(() => Int, { nullable: true })
    municipio_id?: number;

    @Field({ nullable: true })
    facultad_o_campus?: string;

    @Field({ nullable: true })
    punto_entrega_habitual?: string;

    @Field({ nullable: true })
    estado_laboral?: string;

    // Las comisiones y metas las omitimos en la creación porque el SQL ya les pone su valor DEFAULT automáticamente.
}
