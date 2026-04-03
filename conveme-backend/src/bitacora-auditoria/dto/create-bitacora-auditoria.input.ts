import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateBitacoraAuditoriaInput {
    @Field(() => Int, { nullable: true })
    empleado_id?: number;

    @Field()
    accion: string;

    @Field()
    tabla_afectada: string;

    @Field(() => Int, { nullable: true })
    registro_id?: number;

    @Field({ nullable: true })
    detalles?: string;
}
