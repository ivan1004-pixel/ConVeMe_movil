import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
@Entity('promociones')
export class Promocion {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id_promocion: number;

    @Field()
    @Column()
    nombre: string; // Ej: "Promo Buen Fin", "3x2 en Pines"

    @Field({ nullable: true })
    @Column({ type: 'text', nullable: true })
    descripcion: string;

    @Field()
    @Column()
    tipo_promocion: string; // Ej: 'Porcentaje', 'Monto Fijo', 'NxM' (Como 3x2)

    @Field(() => Float, { nullable: true })
    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    valor_descuento: number;

    @Field()
    @Column({ type: 'datetime' })
    fecha_inicio: Date;

    @Field()
    @Column({ type: 'datetime' })
    fecha_fin: Date;

    @Field()
    @Column({ default: true })
    activa: boolean;
}
