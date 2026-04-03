import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Categoria } from '../categorias/categoria.entity';
import { Tamano } from '../tamanos/tamano.entity';

@ObjectType()
@Entity('productos')
export class Producto {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id_producto: number;

    @Field()
    @Column({ unique: true })
    sku: string;

    @Field()
    @Column()
    nombre: string;

    @Field(() => Int)
    @Column()
    categoria_id: number;

    @Field(() => Categoria, { nullable: true })
    @ManyToOne(() => Categoria)
    @JoinColumn({ name: 'categoria_id' })
    categoria: Categoria;

    // DOCUMENTACIÓN: GraphQL usa "tamano_id" pero SQL mapea a la columna "tamaño_id"
    @Field(() => Int)
    @Column({ name: 'tamaño_id' })
    tamano_id: number;

    @Field(() => Tamano, { nullable: true })
    @ManyToOne(() => Tamano)
    @JoinColumn({ name: 'tamaño_id' })
    tamano: Tamano;

    @Field(() => Float)
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    precio_unitario: number;

    @Field(() => Float, { nullable: true })
    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    precio_mayoreo: number;

    @Field(() => Int)
    @Column({ default: 12 })
    cantidad_minima_mayoreo: number;

    @Field(() => Float, { nullable: true })
    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    costo_produccion: number;

    @Field()
    @Column({ default: true })
    activo: boolean;
}
