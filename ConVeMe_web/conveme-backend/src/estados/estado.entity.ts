import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Pais } from '../paises/pais.entity';

@ObjectType()
@Entity('estados')
export class Estado {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id_estado: number;

    @Field(() => Int)
    @Column()
    pais_id: number;

    @Field()
    @Column()
    nombre: string;

    // DOCUMENTACIÓN: Relación Muchos a Uno con Países. La FK es pais_id.
    @Field(() => Pais, { nullable: true })
    @ManyToOne(() => Pais)
    @JoinColumn({ name: 'pais_id' })
    pais: Pais;
}
