import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Venta } from './venta.entity';
import { Producto } from '../../productos/producto.entity';

@ObjectType()
@Entity('det_ventas')
export class DetVenta {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id_det_venta: number;

    @Field(() => Int)
    @Column()
    venta_id: number;

    @Field(() => Venta, { nullable: true })
    @ManyToOne(() => Venta, venta => venta.detalles, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'venta_id' })
    venta: Venta;

    @Field(() => Int)
    @Column()
    producto_id: number;

    @Field(() => Producto, { nullable: true })
    @ManyToOne(() => Producto)
    @JoinColumn({ name: 'producto_id' })
    producto: Producto;

    @Field(() => Int)
    @Column()
    cantidad: number;

    @Field(() => Float)
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    precio_unitario: number;
}
