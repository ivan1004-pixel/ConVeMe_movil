import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Producto } from '../productos/producto.entity';
import { Empleado } from '../empleados/empleado.entity';

@ObjectType()
@Entity('movimientos_inventario')
export class MovimientoInventario {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id_movimiento: number;

    @Field(() => Int)
    @Column()
    producto_id: number;

    @Field(() => Producto, { nullable: true })
    @ManyToOne(() => Producto)
    @JoinColumn({ name: 'producto_id' })
    producto: Producto;

    @Field()
    @Column()
    tipo_movimiento: string; // 'Entrada' o 'Salida'

    @Field(() => Int)
    @Column()
    cantidad: number;

    @Field()
    @Column()
    motivo: string; // Ej: 'Producción', 'Ajuste Manual', 'Merma'

    @Field()
    @CreateDateColumn()
    fecha_movimiento: Date;

    // Opcional: Saber qué empleado registró este movimiento en el sistema
    @Field(() => Int, { nullable: true })
    @Column({ nullable: true })
    empleado_id: number;

    @Field(() => Empleado, { nullable: true })
    @ManyToOne(() => Empleado)
    @JoinColumn({ name: 'empleado_id' })
    empleado: Empleado;
}
