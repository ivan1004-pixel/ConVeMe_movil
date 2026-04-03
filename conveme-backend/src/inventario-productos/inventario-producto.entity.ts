import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Producto } from '../productos/producto.entity';

@ObjectType()
@Entity('inventario_productos')
export class InventarioProducto {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id_inventario: number;

    @Field(() => Int)
    @Column({ unique: true })
    producto_id: number;

    // DOCUMENTACIÓN: Relación Uno a Uno con el Catálogo de Productos
    @Field(() => Producto, { nullable: true })
    @OneToOne(() => Producto)
    @JoinColumn({ name: 'producto_id' })
    producto: Producto;

    @Field(() => Int)
    @Column({ default: 0 })
    stock_actual: number;

    @Field(() => Int)
    @Column({ default: 10 })
    stock_minimo_alerta: number;
}
