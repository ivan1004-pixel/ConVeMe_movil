import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Rol } from '../roles/role.entity';

@ObjectType()
@Entity('usuarios')
export class Usuario {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id_usuario: number;

    @Field()
    @Column({ unique: true })
    username: string;

    @Column()
    password_hash: string;

    @Field(() => Int, { nullable: true })
    @Column({ nullable: true })
    rol_id: number;

    // Relación: Muchos usuarios pertenecen a un rol
    @Field(() => Rol, { nullable: true })
    @ManyToOne(() => Rol, rol => rol.usuarios)
    @JoinColumn({ name: 'rol_id' })
    rol: Rol;

    @Field()
    @Column({ default: true })
    activo: boolean;

    @Field({ nullable: true })
    @Column({ type: 'datetime', nullable: true })
    ultimo_acceso: Date;

    @Field()
    @CreateDateColumn()
    created_at: Date;
}
