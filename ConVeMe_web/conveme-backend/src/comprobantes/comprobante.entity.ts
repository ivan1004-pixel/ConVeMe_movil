import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Vendedor } from '../vendedores/vendedor.entity';
// Asegúrate de tener una entidad de Usuario (el admin que hace el corte)
import { Usuario } from '../usuarios/usuario.entity';

@ObjectType()
@Entity('comprobantes')
export class Comprobante {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id_comprobante: number;

    // ¿De qué vendedor es este corte?
    @Field(() => Int)
    @Column()
    vendedor_id: number;

    @Field(() => Vendedor)
    @ManyToOne(() => Vendedor)
    @JoinColumn({ name: 'vendedor_id' })
    vendedor: Vendedor;

    // ¿Qué Admin le hizo el corte?
    @Field(() => Int)
    @Column()
    admin_id: number;

    @Field(() => Usuario)
    @ManyToOne(() => Usuario)
    @JoinColumn({ name: 'admin_id' })
    admin: Usuario;

    // Finanzas del Corte
    @Field(() => Float)
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    total_vendido: number;

    @Field(() => Float)
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    comision_vendedor: number;

    @Field(() => Float)
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    monto_entregado: number; // Lo que realmente pagó en ese momento

    @Field(() => Float)
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    saldo_pendiente: number; // Si quedó a deber algo

    @Field()
    @CreateDateColumn()
    fecha_corte: Date;

    @Field({ nullable: true })
    @Column({ type: 'text', nullable: true })
    notas: string;
}
