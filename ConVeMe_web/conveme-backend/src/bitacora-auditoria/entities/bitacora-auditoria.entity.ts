import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Empleado } from '../../empleados/empleado.entity';

@ObjectType()
@Entity('bitacora_auditoria')
export class BitacoraAuditoria {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id_auditoria: number;

    @Field(() => Int, { nullable: true })
    @Column({ nullable: true })
    empleado_id: number; // Quién hizo el movimiento (si fue el sistema, queda nulo)

    @Field(() => Empleado, { nullable: true })
    @ManyToOne(() => Empleado)
    @JoinColumn({ name: 'empleado_id' })
    empleado: Empleado;

    @Field()
    @Column()
    accion: string; // Ej: 'INSERT', 'UPDATE', 'DELETE'

    @Field()
    @Column()
    tabla_afectada: string; // Ej: 'ventas', 'cortes_vendedor', 'productos'

    @Field(() => Int, { nullable: true })
    @Column({ nullable: true })
    registro_id: number; // El ID del dato que se modificó

    @Field({ nullable: true })
    @Column({ type: 'text', nullable: true })
    detalles: string; // Qué cambió exactamente (puedes guardar un JSON en texto)

    @Field()
    @CreateDateColumn()
    fecha_hora: Date;
}
