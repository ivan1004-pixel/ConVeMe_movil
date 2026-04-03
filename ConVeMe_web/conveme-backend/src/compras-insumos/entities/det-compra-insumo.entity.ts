import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { CompraInsumo } from './compra-insumo.entity';
import { Insumo } from '../../insumos/insumo.entity';

@ObjectType()
@Entity('det_compras_insumos')
export class DetCompraInsumo {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id_det_compra: number;

    @Field(() => Int)
    @Column()
    compra_insumo_id: number;

    @Field(() => CompraInsumo, { nullable: true })
    @ManyToOne(() => CompraInsumo, compra => compra.detalles, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'compra_insumo_id' })
    compra: CompraInsumo;

    @Field(() => Int)
    @Column()
    insumo_id: number;

    @Field(() => Insumo, { nullable: true })
    @ManyToOne(() => Insumo)
    @JoinColumn({ name: 'insumo_id' })
    insumo: Insumo;

    @Field(() => Float)
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    cantidad_comprada: number;

    @Field(() => Float, { nullable: true })
    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    costo_unitario: number;
}
