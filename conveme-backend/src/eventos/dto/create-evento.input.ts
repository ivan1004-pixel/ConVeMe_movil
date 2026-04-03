import { InputType, Field, Int, Float } from '@nestjs/graphql';

@InputType()
export class CreateEventoInput {
    @Field()
    nombre: string;

    @Field({ nullable: true })
    descripcion?: string;

    @Field()
    fecha_inicio: Date;

    @Field()
    fecha_fin: Date;

    @Field(() => Int, { nullable: true })
    escuela_id?: number;

    @Field(() => Int, { nullable: true })
    municipio_id?: number;

    @Field(() => Float, { nullable: true })
    costo_stand?: number;

    @Field({ nullable: true })
    activo?: boolean;
}
