import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from './role.entity';
import { CreateRolInput } from './dto/create-rol.input';
import { UpdateRolInput } from './dto/update-rol.input';

@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(Rol)
        private readonly rolRepository: Repository<Rol>,
    ) {}

    async create(createRolInput: CreateRolInput): Promise<Rol> {
        const nuevoRol = this.rolRepository.create(createRolInput);
        return this.rolRepository.save(nuevoRol);
    }

    async findAll(): Promise<Rol[]> {
        return this.rolRepository.find();
    }

    async findOne(id_rol: number): Promise<Rol> {
        const rol = await this.rolRepository.findOneBy({ id_rol });
        if (!rol) throw new NotFoundException(`Rol #${id_rol} no encontrado`);
        return rol;
    }

    async update(id_rol: number, updateRolInput: UpdateRolInput): Promise<Rol> {
        const rol = await this.findOne(id_rol);
        Object.assign(rol, updateRolInput);
        return this.rolRepository.save(rol);
    }

    async remove(id_rol: number): Promise<boolean> {
        const resultado = await this.rolRepository.delete(id_rol);
        return (resultado.affected ?? 0) > 0;
    }
}
