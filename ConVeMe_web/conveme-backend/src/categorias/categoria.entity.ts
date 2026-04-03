import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
@Entity('categorias')
export class Categoria {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id_categoria: number;

    @Field()
    @Column({ unique: true })
    nombre: string;

    // 👇 AÑADIDO: Para el Soft Delete
    @Field()
    @Column({ default: true })
    activo: boolean;
}
