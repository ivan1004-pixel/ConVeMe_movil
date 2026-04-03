import { InputType, Field, Float } from '@nestjs/graphql';

@InputType()
export class CreatePromocionInput {
    @Field()
    nombre: string;

    @Field({ nullable: true })
    descripcion?: string;

    @Field()
    tipo_promocion: string;

    @Field(() => Float, { nullable: true })
    valor_descuento?: number;

    @Field()
    fecha_inicio: Date;

    @Field()
    fecha_fin: Date;

    @Field({ nullable: true })
    activa?: boolean;
}
