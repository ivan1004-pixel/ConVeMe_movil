import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Cliente } from '../../clientes/cliente.entity';
import { Vendedor } from '../../vendedores/vendedor.entity';
import { DetVenta } from './det-venta.entity';

@ObjectType()
@Entity('ventas')
export class Venta {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id_venta: number;

    @Field()
    @CreateDateColumn()
    fecha_venta: Date;

    @Field(() => Int, { nullable: true })
    @Column({ nullable: true })
    cliente_id: number;

    @Field(() => Cliente, { nullable: true })
    @ManyToOne(() => Cliente)
    @JoinColumn({ name: 'cliente_id' })
    cliente: Cliente;

    @Field(() => Int, { nullable: true })
    @Column({ nullable: true })
    vendedor_id: number;

    @Field(() => Vendedor, { nullable: true })
    @ManyToOne(() => Vendedor)
    @JoinColumn({ name: 'vendedor_id' })
    vendedor: Vendedor;

    @Field(() => Float)
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    monto_total: number;

    @Field({ nullable: true })
    @Column({ nullable: true })
    metodo_pago: string;

    @Field()
    @Column({ default: 'Completada' })
    estado: string;

    @Field(() => [DetVenta], { nullable: true })
    @OneToMany(() => DetVenta, detalle => detalle.venta, { cascade: true })
    detalles: DetVenta[];
}
