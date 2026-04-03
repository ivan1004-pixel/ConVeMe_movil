import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Vendedor } from '../../vendedores/vendedor.entity';
import { DetAsignacion } from './det-asignacion.entity';

@ObjectType()
@Entity('asignaciones_vendedor')
export class AsignacionVendedor {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id_asignacion: number;

    @Field(() => Int)
    @Column()
    vendedor_id: number;

    @Field(() => Vendedor, { nullable: true })
    @ManyToOne(() => Vendedor)
    @JoinColumn({ name: 'vendedor_id' })
    vendedor: Vendedor;

    @Field()
    @CreateDateColumn()
    fecha_asignacion: Date;

    @Field()
    @Column({ default: 'Activa' }) // Ej: Activa, Liquidada, Devuelta
    estado: string;

    // DOCUMENTACIÓN: Relación en cascada para guardar la lista de productos asignados
    @Field(() => [DetAsignacion], { nullable: true })
    @OneToMany(() => DetAsignacion, detalle => detalle.asignacion, { cascade: true, orphanedRowAction: 'delete' }) // <-- AÑADIDO: orphanedRowAction
    detalles: DetAsignacion[];


}

@ObjectType()
export class PaginatedAsignaciones {
    @Field(() => [AsignacionVendedor])
    data: AsignacionVendedor[];

    @Field(() => Int)
    total: number;
}
