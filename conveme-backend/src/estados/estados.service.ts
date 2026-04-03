import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estado } from './estado.entity';
import { CreateEstadoInput } from './dto/create-estado.input';
import { UpdateEstadoInput } from './dto/update-estado.input';

@Injectable()
export class EstadosService {
    constructor(
        @InjectRepository(Estado)
        private readonly estadoRepository: Repository<Estado>,
    ) {}

    async create(createEstadoInput: CreateEstadoInput): Promise<Estado> {
        const nuevo = this.estadoRepository.create(createEstadoInput);
        const guardado = await this.estadoRepository.save(nuevo);

        // LA MAGIA: Buscamos el registro recién creado para que traiga el País anidado
        return this.findOne(guardado.id_estado);
    }

    async findAll(): Promise<Estado[]> {
        return this.estadoRepository.find({ relations: ['pais'] });
    }

    async findOne(id_estado: number): Promise<Estado> {
        const estado = await this.estadoRepository.findOne({
            where: { id_estado },
            relations: ['pais']
        });
        if (!estado) throw new NotFoundException(`Estado #${id_estado} no encontrado`);
        return estado;
    }

    async update(id_estado: number, updateEstadoInput: UpdateEstadoInput): Promise<Estado> {
        const estado = await this.findOne(id_estado);
        Object.assign(estado, updateEstadoInput);
        await this.estadoRepository.save(estado);

        // Recargamos para devolver las relaciones actualizadas
        return this.findOne(id_estado);
    }

    async remove(id_estado: number): Promise<boolean> {
        const result = await this.estadoRepository.delete(id_estado);
        return (result.affected ?? 0) > 0;
    }
}
