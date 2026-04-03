import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Municipio } from '../municipios/municipio.entity';

@ObjectType()
@Entity('escuelas')
export class Escuela {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id_escuela: number;

    @Field()
    @Column({ unique: true })
    nombre: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    siglas: string;

    @Field(() => Int)
    @Column()
    municipio_id: number;

    @Field(() => Municipio, { nullable: true })
    @ManyToOne(() => Municipio)
    @JoinColumn({ name: 'municipio_id' })
    municipio: Municipio;

    @Field()
    @Column({ default: true }) // 👈 Muy importante para que nazcan activas
    activa: boolean;
}
