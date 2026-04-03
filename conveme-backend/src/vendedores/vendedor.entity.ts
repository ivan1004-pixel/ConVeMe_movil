import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Usuario } from '../usuarios/usuario.entity';
import { Escuela } from '../escuelas/escuela.entity';
import { Municipio } from '../municipios/municipio.entity';

@ObjectType()
@Entity('vendedores')
export class Vendedor {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id_vendedor: number;

    @Field(() => Int)
    @Column({ unique: true })
    usuario_id: number;

    @Field(() => Usuario, { nullable: true })
    @OneToOne(() => Usuario)
    @JoinColumn({ name: 'usuario_id' })
    usuario: Usuario;

    @Field(() => Int, { nullable: true })
    @Column({ nullable: true })
    escuela_id: number;

    @Field(() => Escuela, { nullable: true })
    @ManyToOne(() => Escuela, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'escuela_id' })
    escuela: Escuela;

    @Field()
    @Column()
    nombre_completo: string;

    @Field()
    @Column({ unique: true })
    email: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    telefono: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    instagram_handle: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    calle_y_numero: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    colonia: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    codigo_postal: string;

    @Field(() => Int, { nullable: true })
    @Column({ nullable: true })
    municipio_id: number;

    @Field(() => Municipio, { nullable: true })
    @ManyToOne(() => Municipio)
    @JoinColumn({ name: 'municipio_id' })
    municipio: Municipio;

    @Field({ nullable: true })
    @Column({ nullable: true })
    facultad_o_campus: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    punto_entrega_habitual: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    estado_laboral: string;

    // Usamos Float para GraphQL y decimal para TypeORM
    @Field(() => Float)
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 10 })
    comision_fija_menudeo: number;

    @Field(() => Float)
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 5 })
    comision_fija_mayoreo: number;

    @Field(() => Float)
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    meta_ventas_mensual: number;
}
