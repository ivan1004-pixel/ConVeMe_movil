import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Usuario } from '../usuarios/usuario.entity';

@ObjectType()
@Entity('clientes')
export class Cliente {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id_cliente: number;

  // Puede ser nulo por si es un cliente que compró en persona y no tiene cuenta web
  @Field(() => Int, { nullable: true })
  @Column({ unique: true, nullable: true })
  usuario_id: number;

  @Field(() => Usuario, { nullable: true })
  @OneToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Field({ nullable: true })
  @Column({ nullable: true })
  nombre_completo: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  email: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  telefono: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  direccion_envio: string;

  // DOCUMENTACIÓN: Generamos la fecha automáticamente tal como dice el SQL (DEFAULT now())
  @Field()
  @CreateDateColumn()
  fecha_registro: Date;
}
