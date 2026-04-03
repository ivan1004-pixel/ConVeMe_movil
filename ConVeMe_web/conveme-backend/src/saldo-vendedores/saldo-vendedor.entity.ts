import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Vendedor } from '../vendedores/vendedor.entity';

@ObjectType()
@Entity('saldo_vendedores')
export class SaldoVendedor {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id_saldo: number;

    @Field(() => Int)
    @Column({ unique: true }) // Regla de oro: Un solo registro de saldo por vendedor
    vendedor_id: number;

    @Field(() => Vendedor, { nullable: true })
    @OneToOne(() => Vendedor)
    @JoinColumn({ name: 'vendedor_id' })
    vendedor: Vendedor;

    @Field(() => Float)
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    saldo_actual: number;
}
