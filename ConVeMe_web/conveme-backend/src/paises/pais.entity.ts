import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
// import { Estado } from '../estados/estado.entity'; // Lo crearemos en el siguiente paso

@ObjectType()
@Entity('paises')
export class Pais {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id_pais: number;

    @Field()
    @Column({ unique: true })
    nombre: string;

    // DOCUMENTACIÓN: Relación uno a muchos. Un país tiene muchos estados.
    // Lo dejamos comentado por ahora hasta que creemos la entidad Estado.
    /*
     * @OneToMany(() => Estado, estado => estado.pais)
     * estados: Estado[];
     */
}
