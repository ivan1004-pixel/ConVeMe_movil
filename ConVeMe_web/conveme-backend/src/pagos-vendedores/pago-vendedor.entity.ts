import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Vendedor } from '../vendedores/vendedor.entity';

@ObjectType()
@Entity('pagos_vendedores')
export class PagoVendedor {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id_pago: number;

    @Field(() => Int)
    @Column()
    vendedor_id: number;

    @Field(() => Vendedor, { nullable: true })
    @ManyToOne(() => Vendedor)
    @JoinColumn({ name: 'vendedor_id' })
    vendedor: Vendedor;

    @Field()
    @CreateDateColumn()
    fecha_pago: Date;

    // El monto exacto de dinero que le transferiste
    @Field(() => Float)
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    monto_pagado: number;

    @Field()
    @Column()
    metodo_pago: string; // Ej: Transferencia, Efectivo

    @Field({ nullable: true })
    @Column({ nullable: true })
    referencia_o_comprobante: string; // El folio del banco o un link al PDF
}
