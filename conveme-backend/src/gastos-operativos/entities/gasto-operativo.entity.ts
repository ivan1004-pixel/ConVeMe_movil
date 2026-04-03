import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { CategoriaGasto } from '../../categorias-gasto/entities/categoria-gasto.entity';
import { Empleado } from '../../empleados/empleado.entity';

@ObjectType()
@Entity('gastos_operativos')
export class GastoOperativo {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id_gasto: number;

    @Field(() => Int)
    @Column()
    categoria_id: number;

    @Field(() => CategoriaGasto, { nullable: true })
    @ManyToOne(() => CategoriaGasto)
    @JoinColumn({ name: 'categoria_id' })
    categoria: CategoriaGasto;

    @Field(() => Int, { nullable: true })
    @Column({ nullable: true })
    empleado_id: number; // Quién hizo o reportó el gasto

    @Field(() => Empleado, { nullable: true })
    @ManyToOne(() => Empleado)
    @JoinColumn({ name: 'empleado_id' })
    empleado: Empleado;

    @Field()
    @CreateDateColumn()
    fecha_gasto: Date;

    @Field(() => Float)
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    monto: number;

    @Field()
    @Column({ type: 'text' })
    descripcion: string; // Ej: "Pago de campaña Facebook Día del Estudiante"

    @Field({ nullable: true })
    @Column({ nullable: true })
    comprobante_url: string; // Un link a la foto del ticket o PDF de la factura
}
