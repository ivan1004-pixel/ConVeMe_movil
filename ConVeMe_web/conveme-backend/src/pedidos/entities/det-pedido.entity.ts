import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Pedido } from './pedido.entity';
import { Producto } from '../../productos/producto.entity';

@ObjectType()
@Entity('det_pedidos')
export class DetPedido {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id_det_pedido: number; // Coincide con tu diagrama

    @Field(() => Int)
    @Column()
    pedido_id: number; // Coincide con tu diagrama

    @Field(() => Pedido, { nullable: true })
    @ManyToOne(() => Pedido, pedido => pedido.detalles, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'pedido_id' })
    pedido: Pedido;

    @Field(() => Int)
    @Column()
    producto_id: number; // Coincide con tu diagrama

    @Field(() => Producto, { nullable: true })
    @ManyToOne(() => Producto)
    @JoinColumn({ name: 'producto_id' })
    producto: Producto;

    @Field(() => Int)
    @Column()
    cantidad: number; // Coincide con tu diagrama

    // Le agregamos precio para que no se te mueva si cambias el catálogo después
    @Field(() => Float)
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    precio_unitario: number;
}
