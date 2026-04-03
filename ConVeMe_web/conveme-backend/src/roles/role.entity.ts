import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Usuario } from '../usuarios/usuario.entity';

@ObjectType() // Permite usar esta clase como un tipo de retorno en GraphQL
@Entity('roles') // Nombre exacto de la tabla en tu SQL
export class Rol {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id_rol: number;

    @Field()
    @Column({ unique: true })
    nombre: string;

    @Field({ nullable: true })
    @Column({ type: 'text', nullable: true })
    descripcion: string;

    // Relación: Un rol puede tener muchos usuarios
    @OneToMany(() => Usuario, usuario => usuario.rol)
    usuarios: Usuario[];
}
