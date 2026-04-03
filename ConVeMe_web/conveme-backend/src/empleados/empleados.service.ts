import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empleado } from './empleado.entity';
import { CreateEmpleadoInput } from './dto/create-empleado.input';
import { UpdateEmpleadoInput } from './dto/update-empleado.input';

@Injectable()
export class EmpleadosService {
    constructor(
        @InjectRepository(Empleado)
        private readonly empleadoRepository: Repository<Empleado>,
    ) {}

    async create(createEmpleadoInput: CreateEmpleadoInput): Promise<Empleado> {
        // Validaciones: Evitar duplicados de usuario, correo o teléfono
        const empExistente = await this.empleadoRepository.findOne({ where: { usuario_id: createEmpleadoInput.usuario_id }});
        if (empExistente) throw new ConflictException(`El Usuario ID #${createEmpleadoInput.usuario_id} ya es un empleado.`);

        const emailExistente = await this.empleadoRepository.findOne({ where: { email: createEmpleadoInput.email }});
        if (emailExistente) throw new ConflictException(`El correo ${createEmpleadoInput.email} ya está en uso.`);

        if (createEmpleadoInput.telefono) {
            const telExistente = await this.empleadoRepository.findOne({ where: { telefono: createEmpleadoInput.telefono }});
            if (telExistente) throw new ConflictException(`El teléfono ${createEmpleadoInput.telefono} ya está registrado.`);
        }

        const nuevoEmpleado = this.empleadoRepository.create(createEmpleadoInput);
        const guardado = await this.empleadoRepository.save(nuevoEmpleado);
        return this.findOne(guardado.id_empleado);
    }

    async findAll(): Promise<Empleado[]> {
        return this.empleadoRepository.find({
            where: { activo: true }, // Solo empleados activos
            relations: ['usuario', 'usuario.rol', 'municipio', 'municipio.estado']
        });
    }

    async findOne(id_empleado: number): Promise<Empleado> {
        const empleado = await this.empleadoRepository.findOne({
            where: { id_empleado },
            relations: ['usuario', 'usuario.rol', 'municipio', 'municipio.estado'],
        });
        if (!empleado) throw new NotFoundException(`Empleado #${id_empleado} no encontrado`);
        return empleado;
    }

    async update(id_empleado: number, updateEmpleadoInput: UpdateEmpleadoInput): Promise<Empleado> {
        const empleado = await this.empleadoRepository.preload(updateEmpleadoInput);
        if (!empleado) throw new NotFoundException(`Empleado #${id_empleado} no encontrado`);

        await this.empleadoRepository.save(empleado);
        return this.findOne(id_empleado);
    }

    async remove(id_empleado: number): Promise<Empleado> {
        const empleado = await this.findOne(id_empleado);
        empleado.activo = false; // Soft Delete
        await this.empleadoRepository.save(empleado);
        return empleado;
    }
}
