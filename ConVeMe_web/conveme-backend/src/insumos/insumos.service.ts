import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Insumo } from './insumo.entity';
import { CreateInsumoInput } from './dto/create-insumo.input';
import { UpdateInsumoInput } from './dto/update-insumo.input';

@Injectable()
export class InsumosService {
    constructor(
        @InjectRepository(Insumo)
        private readonly insumoRepository: Repository<Insumo>,
    ) {}

    async create(createInsumoInput: CreateInsumoInput): Promise<Insumo> {
        const nuevo = this.insumoRepository.create(createInsumoInput);
        const guardado = await this.insumoRepository.save(nuevo);
        return this.findOne(guardado.id_insumo);
    }

    async findAll(): Promise<Insumo[]> {
        return this.insumoRepository.find();
    }

    async findOne(id_insumo: number): Promise<Insumo> {
        const insumo = await this.insumoRepository.findOne({ where: { id_insumo } });
        if (!insumo) throw new NotFoundException(`Insumo #${id_insumo} no encontrado`);
        return insumo;
    }

    async update(id_insumo: number, updateInsumoInput: UpdateInsumoInput): Promise<Insumo> {
        const insumo = await this.findOne(id_insumo);
        Object.assign(insumo, updateInsumoInput);
        await this.insumoRepository.save(insumo);
        return this.findOne(id_insumo);
    }

    async remove(id_insumo: number): Promise<boolean> {
        const resultado = await this.insumoRepository.delete(id_insumo);
        return (resultado.affected ?? 0) > 0;
    }
}
