import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Estado } from '../estados/estado.entity';

@ObjectType()
@Entity('municipios')
export class Municipio {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id_municipio: number;

    @Field(() => Int)
    @Column()
    estado_id: number;

    @Field()
    @Column()
    nombre: string;

    // Relación Muchos a Uno con Estados.
    @Field(() => Estado, { nullable: true })
    @ManyToOne(() => Estado)
    @JoinColumn({ name: 'estado_id' })
    estado: Estado;
}
