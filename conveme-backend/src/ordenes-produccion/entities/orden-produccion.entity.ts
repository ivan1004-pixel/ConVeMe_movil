import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Producto } from '../../productos/producto.entity';
import { Empleado } from '../../empleados/empleado.entity';
import { DetOrdenProduccion } from './det-orden-produccion.entity';

@ObjectType()
@Entity('ordenes_produccion')
export class OrdenProduccion {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id_orden_produccion: number;

    @Field(() => Int)
    @Column()
    producto_id: number;

    @Field(() => Producto, { nullable: true })
    @ManyToOne(() => Producto)
    @JoinColumn({ name: 'producto_id' })
    producto: Producto;

    @Field(() => Int)
    @Column()
    empleado_id: number; // El artesano/empleado a cargo

    @Field(() => Empleado, { nullable: true })
    @ManyToOne(() => Empleado)
    @JoinColumn({ name: 'empleado_id' })
    empleado: Empleado;

    @Field(() => Int)
    @Column()
    cantidad_a_producir: number;

    @Field()
    @CreateDateColumn()
    fecha_orden: Date;

    @Field()
    @Column({ default: 'Pendiente' }) // Pendiente, En Proceso, Finalizada
    estado: string;

    @Field(() => [DetOrdenProduccion], { nullable: true })
    @OneToMany(() => DetOrdenProduccion, detalle => detalle.orden_produccion, { cascade: true })
    detalles: DetOrdenProduccion[];
}
