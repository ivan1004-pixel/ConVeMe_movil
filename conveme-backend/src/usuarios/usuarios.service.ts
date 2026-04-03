import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './usuario.entity';
import { CreateUsuarioInput } from './dto/create-usuario.input';
import { UpdateUsuarioInput } from './dto/update-usuario.input';

@Injectable()
export class UsuariosService {
    constructor(
        @InjectRepository(Usuario)
        private readonly usuarioRepository: Repository<Usuario>,
    ) {}

    async create(createUsuarioInput: CreateUsuarioInput): Promise<Usuario> {
        const { password_raw, ...restoDatos } = createUsuarioInput;
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password_raw, saltRounds);

        const nuevoUsuario = this.usuarioRepository.create({
            ...restoDatos,
            password_hash,
        });

        return this.usuarioRepository.save(nuevoUsuario);
    }

    async findAll(): Promise<Usuario[]> {
        return this.usuarioRepository.find({ relations: ['rol'] });
    }

    async findByUsername(username: string): Promise<Usuario | null> {
        return this.usuarioRepository.findOne({ where: { username } });
    }

    async findOne(id_usuario: number): Promise<Usuario> {
        const usuario = await this.usuarioRepository.findOne({
            where: { id_usuario },
            relations: ['rol']
        });

        if (!usuario) throw new NotFoundException(`Usuario #${id_usuario} no encontrado`);
        return usuario;
    }

    async update(id_usuario: number, updateUsuarioInput: UpdateUsuarioInput): Promise<Usuario> {
        const usuario = await this.findOne(id_usuario);

        // Si manda un nuevo password, lo encriptamos
        if (updateUsuarioInput.password_raw) {
            usuario.password_hash = await bcrypt.hash(updateUsuarioInput.password_raw, 10);
            delete updateUsuarioInput.password_raw;
        }

        Object.assign(usuario, updateUsuarioInput);
        return this.usuarioRepository.save(usuario);
    }

    async remove(id_usuario: number): Promise<boolean> {
        const resultado = await this.usuarioRepository.delete(id_usuario);
        return (resultado.affected ?? 0) > 0;
    }
}
