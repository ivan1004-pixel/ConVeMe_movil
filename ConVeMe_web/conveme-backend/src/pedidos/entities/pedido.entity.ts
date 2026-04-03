import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Cliente } from '../../clientes/cliente.entity';
import { DetPedido } from './det-pedido.entity';
import { Vendedor } from '../../vendedores/vendedor.entity';

@ObjectType()
@Entity('pedidos')
export class Pedido {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id_pedido: number;

    @Field(() => Int, { nullable: true })
    @Column({ nullable: true })
    cliente_id: number;

    @Field(() => Cliente, { nullable: true })
    @ManyToOne(() => Cliente)
    @JoinColumn({ name: 'cliente_id' })
    cliente: Cliente;

    // 👇 ¡NUEVO! Creamos el espacio para el vendedor
    @Field(() => Int, { nullable: true })
    @Column({ nullable: true })
    vendedor_id: number;

    @Field(() => Vendedor, { nullable: true })
    @ManyToOne(() => Vendedor)
    @JoinColumn({ name: 'vendedor_id' })
    vendedor: Vendedor;

    @Field()
    @CreateDateColumn()
    fecha_pedido: Date;

    @Field({ nullable: true })
    @Column({ type: 'date', nullable: true })
    fecha_entrega_estimada: Date;

    @Field(() => Float)
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    monto_total: number;

    @Field(() => Float)
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    anticipo: number;

    @Field()
    @Column({ default: 'Pendiente' })
    estado: string;

    @Field(() => [DetPedido], { nullable: true })
    @OneToMany(() => DetPedido, detalle => detalle.pedido, { cascade: true })
    detalles: DetPedido[];
}
