import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
@Entity('tamaños')
export class Tamano {
    @Field(() => Int)
    // usará "id_tamano", pero TypeORM lo mapeará a "id_tamaño" en SQL
    @PrimaryGeneratedColumn({ name: 'id_tamaño' })
    id_tamano: number;

    @Field()
    @Column({ unique: true })
    descripcion: string;

    // 👇 AÑADIDO: Para el Soft Delete
    @Field()
    @Column({ default: true })
    activo: boolean;
}
