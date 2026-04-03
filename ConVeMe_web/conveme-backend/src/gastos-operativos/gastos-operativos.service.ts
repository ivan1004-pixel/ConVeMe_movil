import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GastoOperativo } from './entities/gasto-operativo.entity';
import { CreateGastoOperativoInput } from './dto/create-gasto-operativo.input';
import { UpdateGastoOperativoInput } from './dto/update-gasto-operativo.input';

@Injectable()
export class GastosOperativosService {
    constructor(
        @InjectRepository(GastoOperativo)
        private readonly gastoRepository: Repository<GastoOperativo>,
    ) {}

    async create(createGastoInput: CreateGastoOperativoInput): Promise<GastoOperativo> {
        const nuevo = this.gastoRepository.create(createGastoInput);
        const guardado = await this.gastoRepository.save(nuevo);
        return this.findOne(guardado.id_gasto);
    }

    async findAll(): Promise<GastoOperativo[]> {
        return this.gastoRepository.find({ relations: ['categoria', 'empleado'] });
    }

    async findOne(id_gasto: number): Promise<GastoOperativo> {
        const gasto = await this.gastoRepository.findOne({
            where: { id_gasto },
            relations: ['categoria', 'empleado'],
        });
        if (!gasto) throw new NotFoundException(`Gasto #${id_gasto} no encontrado`);
        return gasto;
    }

    async update(id_gasto: number, updateGastoInput: UpdateGastoOperativoInput): Promise<GastoOperativo> {
        const gasto = await this.findOne(id_gasto);
        Object.assign(gasto, updateGastoInput);
        await this.gastoRepository.save(gasto);
        return this.findOne(id_gasto);
    }

    async remove(id_gasto: number): Promise<boolean> {
        const resultado = await this.gastoRepository.delete(id_gasto);
        return (resultado.affected ?? 0) > 0;
    }
}
