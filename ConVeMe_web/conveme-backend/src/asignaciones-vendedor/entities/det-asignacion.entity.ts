import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { AsignacionVendedor } from './asignacion-vendedor.entity';
import { Producto } from '../../productos/producto.entity';

@ObjectType()
@Entity('det_asignaciones')
export class DetAsignacion {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id_det_asignacion: number;

    @Field(() => Int)
    @Column()
    asignacion_id: number;

    @Field(() => AsignacionVendedor, { nullable: true })
    @ManyToOne(() => AsignacionVendedor, asignacion => asignacion.detalles, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'asignacion_id' })
    asignacion: AsignacionVendedor;

    @Field(() => Int)
    @Column()
    producto_id: number;

    @Field(() => Producto, { nullable: true })
    @ManyToOne(() => Producto)
    @JoinColumn({ name: 'producto_id' })
    producto: Producto;

    @Field(() => Int)
    @Column()
    cantidad_asignada: number;
}


@ObjectType()
export class PaginatedAsignaciones {
    @Field(() => [AsignacionVendedor])
    data: AsignacionVendedor[];

    @Field(() => Int)
    total: number;
}
