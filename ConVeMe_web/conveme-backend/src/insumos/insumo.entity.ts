import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
@Entity('insumos_materia_prima') // DOCUMENTACIÓN: Mapeamos al nombre exacto de tu SQL
export class Insumo {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id_insumo: number;

    @Field()
    @Column({ unique: true })
    nombre: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    unidad_medida: string; // Ej: "Litros", "Kilogramos", "Metros"

    @Field(() => Float)
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    stock_actual: number;

    @Field(() => Float)
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 5 })
    stock_minimo_alerta: number;
}
