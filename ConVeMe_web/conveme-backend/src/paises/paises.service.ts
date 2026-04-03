import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pais } from './pais.entity';
import { CreatePaisInput } from './dto/create-pais.input';
import { UpdatePaisInput } from './dto/update-pais.input';

@Injectable()
export class PaisesService {
    constructor(
        @InjectRepository(Pais)
        private readonly paisRepository: Repository<Pais>,
    ) {}

    async create(createPaisInput: CreatePaisInput): Promise<Pais> {
        const nuevoPais = this.paisRepository.create(createPaisInput);
        return this.paisRepository.save(nuevoPais);
    }

    async findAll(): Promise<Pais[]> {
        return this.paisRepository.find();
    }

    async findOne(id_pais: number): Promise<Pais> {
        const pais = await this.paisRepository.findOneBy({ id_pais });
        if (!pais) throw new NotFoundException(`País #${id_pais} no encontrado`);
        return pais;
    }

    async update(id_pais: number, updatePaisInput: UpdatePaisInput): Promise<Pais> {
        const pais = await this.findOne(id_pais);
        Object.assign(pais, updatePaisInput);
        return this.paisRepository.save(pais);
    }

    async remove(id_pais: number): Promise<boolean> {
        const resultado = await this.paisRepository.delete(id_pais);
        return (resultado.affected ?? 0) > 0;
    }
}
