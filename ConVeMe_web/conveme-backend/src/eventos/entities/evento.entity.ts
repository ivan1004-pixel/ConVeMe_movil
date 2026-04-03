import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Escuela } from '../../escuelas/escuela.entity';
import { Municipio } from '../../municipios/municipio.entity';

@ObjectType()
@Entity('eventos')
export class Evento {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id_evento: number;

    @Field()
    @Column({ length: 255 })
    nombre: string;

    @Field({ nullable: true })
    @Column({ type: 'text', nullable: true })
    descripcion: string;

    @Field()
    @Column({ type: 'datetime' })
    fecha_inicio: Date;

    @Field()
    @Column({ type: 'datetime' })
    fecha_fin: Date;

    @Field(() => Int, { nullable: true })
    @Column({ nullable: true })
    escuela_id: number;

    // 👇 Ya la enlazamos con Escuela
    @Field(() => Escuela, { nullable: true })
    @ManyToOne(() => Escuela)
    @JoinColumn({ name: 'escuela_id' })
    escuela: Escuela;

    @Field(() => Int, { nullable: true })
    @Column({ nullable: true })
    municipio_id: number;

    // 👇 Ya la enlazamos con Municipio
    @Field(() => Municipio, { nullable: true })
    @ManyToOne(() => Municipio)
    @JoinColumn({ name: 'municipio_id' })
    municipio: Municipio;

    @Field(() => Float, { nullable: true })
    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    costo_stand: number;

    @Field()
    @Column({ default: true })
    activo: boolean;
}
