import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { OrdenProduccion } from './orden-produccion.entity';
import { Insumo } from '../../insumos/insumo.entity';

@ObjectType()
@Entity('det_ordenes_produccion')
export class DetOrdenProduccion {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id_det_orden: number;

    @Field(() => Int)
    @Column()
    orden_produccion_id: number;

    @Field(() => OrdenProduccion, { nullable: true })
    @ManyToOne(() => OrdenProduccion, orden => orden.detalles, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'orden_produccion_id' })
    orden_produccion: OrdenProduccion;

    @Field(() => Int)
    @Column()
    insumo_id: number;

    @Field(() => Insumo, { nullable: true })
    @ManyToOne(() => Insumo)
    @JoinColumn({ name: 'insumo_id' })
    insumo: Insumo;

    @Field(() => Float)
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    cantidad_consumida: number;
}
