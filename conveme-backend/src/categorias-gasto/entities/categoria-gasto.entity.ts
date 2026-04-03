import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
@Entity('categorias_gasto')
export class CategoriaGasto {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id_categoria: number;

    @Field()
    @Column({ unique: true })
    nombre: string; // Ej: "Publicidad", "Insumos de Oficina", "Transporte"

    @Field({ nullable: true })
    @Column({ type: 'text', nullable: true })
    descripcion: string;

    @Field()
    @Column({ default: true })
    activa: boolean;
}
