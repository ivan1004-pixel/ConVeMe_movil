import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateDetAsignacionInput {
    // Ya lo teníamos opcional, ¡perfecto!
    @Field(() => Int, { nullable: true })
    id_det_asignacion?: number;

    // 👇 AQUÍ ESTÁ EL TRUCO: Agregamos el asignacion_id como opcional
    // Para que cuando el Frontend lo mande al editar, GraphQL no se asuste.
    @Field(() => Int, { nullable: true })
    asignacion_id?: number;

    @Field(() => Int)
    producto_id: number;

    @Field(() => Int)
    cantidad_asignada: number;
}

@InputType()
export class CreateAsignacionVendedorInput {
    @Field(() => Int)
    vendedor_id: number;

    @Field({ nullable: true })
    estado?: string;

    @Field(() => [CreateDetAsignacionInput])
    detalles: CreateDetAsignacionInput[];
}
