import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Vendedor } from '../vendedores/vendedor.entity';

@ObjectType()
@Entity('cuentas_bancarias_vendedor')
export class CuentaBancaria {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id_cuenta: number;

    @Field(() => Int)
    @Column()
    vendedor_id: number;

    @Field(() => Vendedor, { nullable: true })
    @ManyToOne(() => Vendedor)
    @JoinColumn({ name: 'vendedor_id' })
    vendedor: Vendedor;

    @Field()
    @Column()
    banco: string; // Ej: BBVA, Santander, Nu

    @Field()
    @Column()
    titular_cuenta: string;

    @Field()
    @Column()
    numero_cuenta: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    clabe_interbancaria: string;

    @Field()
    @Column({ default: true })
    activa: boolean; // Por si el vendedor cambia de tarjeta, desactivamos la vieja
}
