import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Empleado } from '../../empleados/empleado.entity';
import { DetCompraInsumo } from './det-compra-insumo.entity';

@ObjectType()
@Entity('compras_insumos')
export class CompraInsumo {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id_compra_insumo: number;

    @Field()
    @Column({ type: 'datetime' })
    fecha_compra: Date;

    @Field({ nullable: true })
    @Column({ nullable: true })
    proveedor: string;

    @Field(() => Float, { nullable: true })
    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    monto_total: number;

    @Field(() => Int, { nullable: true })
    @Column({ nullable: true })
    empleado_id: number;

    @Field(() => Empleado, { nullable: true })
    @ManyToOne(() => Empleado)
    @JoinColumn({ name: 'empleado_id' })
    empleado: Empleado;

    @Field({ nullable: true })
    @Column({ nullable: true })
    comprobante_url: string;

    // DOCUMENTACIÓN: Relación Uno a Muchos con cascade para guardar todo junto
    @Field(() => [DetCompraInsumo], { nullable: true })
    @OneToMany(() => DetCompraInsumo, detalle => detalle.compra, { cascade: true })
    detalles: DetCompraInsumo[];
}
