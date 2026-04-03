import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tamano } from './tamano.entity';
import { CreateTamanoInput } from './dto/create-tamano.input';
import { UpdateTamanoInput } from './dto/update-tamano.input';

@Injectable()
export class TamanosService {
    constructor(
        @InjectRepository(Tamano)
        private readonly tamanoRepository: Repository<Tamano>,
    ) {}

    async create(createTamanoInput: CreateTamanoInput): Promise<Tamano> {
        // 👇 VALIDACIÓN: Evitar tamaños duplicados
        const existe = await this.tamanoRepository.findOne({ where: { descripcion: createTamanoInput.descripcion } });
        if (existe) throw new ConflictException(`El tamaño "${createTamanoInput.descripcion}" ya existe.`);

        const nuevo = this.tamanoRepository.create(createTamanoInput);
        const guardado = await this.tamanoRepository.save(nuevo);
        return this.findOne(guardado.id_tamano);
    }

    async findAll(): Promise<Tamano[]> {
        return this.tamanoRepository.find({
            take: 50, // 👈 EL LÍMITE SALVAVIDAS
            order: { id_tamano: 'DESC' }
        });
    }
    async findOne(id_tamano: number): Promise<Tamano> {
        const tamano = await this.tamanoRepository.findOne({ where: { id_tamano } });
        if (!tamano) throw new NotFoundException(`Tamaño #${id_tamano} no encontrado`);
        return tamano;
    }

    async update(id_tamano: number, updateTamanoInput: UpdateTamanoInput): Promise<Tamano> {
        // Validar si están intentando renombrar a algo que ya existe
        if (updateTamanoInput.descripcion) {
            const existe = await this.tamanoRepository.findOne({ where: { descripcion: updateTamanoInput.descripcion } });
            if (existe && existe.id_tamano !== id_tamano) {
                throw new ConflictException(`El tamaño "${updateTamanoInput.descripcion}" ya está en uso.`);
            }
        }

        const tamano = await this.tamanoRepository.preload(updateTamanoInput);
        if (!tamano) throw new NotFoundException(`Tamaño #${id_tamano} no encontrado`);

        await this.tamanoRepository.save(tamano);
        return this.findOne(id_tamano);
    }

    async remove(id_tamano: number): Promise<Tamano> {
        const tamano = await this.findOne(id_tamano);
        // 👇 SOFT DELETE: Apagamos el switch
        tamano.activo = false;
        await this.tamanoRepository.save(tamano);
        return tamano;
    }
}
