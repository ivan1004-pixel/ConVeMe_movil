import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Escuela } from './escuela.entity';
import { CreateEscuelaInput } from './dto/create-escuela.input';
import { UpdateEscuelaInput } from './dto/update-escuela.input';

@Injectable()
export class EscuelasService {
    constructor(
        @InjectRepository(Escuela)
        private readonly escuelaRepository: Repository<Escuela>,
    ) {}

    async create(createEscuelaInput: CreateEscuelaInput): Promise<Escuela> {
        const nuevaEscuela = this.escuelaRepository.create(createEscuelaInput);
        const guardada = await this.escuelaRepository.save(nuevaEscuela);

        return this.findOne(guardada.id_escuela);
    }

    async findAll(): Promise<Escuela[]> {
        return this.escuelaRepository.find({
            // 👇 FILTRO: Solo le mandamos a React las escuelas que están "vivas"
            where: { activa: true },
            relations: ['municipio', 'municipio.estado', 'municipio.estado.pais']
        });
    }

    async findOne(id_escuela: number): Promise<Escuela> {
        const escuela = await this.escuelaRepository.findOne({
            where: { id_escuela },
            relations: ['municipio', 'municipio.estado', 'municipio.estado.pais'],
        });
        if (!escuela) throw new NotFoundException(`Escuela #${id_escuela} no encontrada`);
        return escuela;
    }

    async update(id_escuela: number, updateEscuelaInput: UpdateEscuelaInput): Promise<Escuela> {
        // Como updateEscuelaInput ya trae el ID, se lo pasamos directo a preload
        const escuela = await this.escuelaRepository.preload(updateEscuelaInput);

        if (!escuela) throw new NotFoundException(`Escuela #${id_escuela} no encontrada`);

        await this.escuelaRepository.save(escuela);
        return this.findOne(id_escuela);
    }

    async remove(id_escuela: number): Promise<Escuela> {
        // 1. Buscamos la escuela (si no existe, findOne lanza el error)
        const escuela = await this.findOne(id_escuela);

        // 2. SOFT DELETE: En lugar de usar .delete(), simplemente le bajamos el switch
        escuela.activa = false;
        await this.escuelaRepository.save(escuela);

        // 3. Devolvemos la escuela (ya apagada)
        return escuela;
    }
}
