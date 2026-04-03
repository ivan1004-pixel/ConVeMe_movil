import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Vendedor } from '../../vendedores/vendedor.entity';
import { AsignacionVendedor } from '../../asignaciones-vendedor/entities/asignacion-vendedor.entity';
import { DetCorteInventario } from './det-corte-inventario.entity';

@ObjectType()
@Entity('cortes_vendedor')
export class CorteVendedor {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id_corte: number;

    @Field(() => Int)
    @Column()
    vendedor_id: number;

    @Field(() => Vendedor, { nullable: true })
    @ManyToOne(() => Vendedor)
    @JoinColumn({ name: 'vendedor_id' })
    vendedor: Vendedor;

    @Field(() => Int)
    @Column()
    asignacion_id: number;

    @Field(() => AsignacionVendedor, { nullable: true })
    @ManyToOne(() => AsignacionVendedor)
    @JoinColumn({ name: 'asignacion_id' })
    asignacion: AsignacionVendedor;

    @Field()
    @CreateDateColumn()
    fecha_corte: Date;

    @Field(() => Float)
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    dinero_esperado: number;

    @Field(() => Float)
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    dinero_total_entregado: number;

    @Field(() => Float)
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    diferencia_corte: number;

    @Field({ nullable: true })
    @Column({ type: 'text', nullable: true })
    observaciones: string;

    // DOCUMENTACIÓN: Guardado en cascada para el detalle del inventario
    @Field(() => [DetCorteInventario], { nullable: true })
    @OneToMany(() => DetCorteInventario, detalle => detalle.corte, { cascade: true })
    detalles: DetCorteInventario[];
}
