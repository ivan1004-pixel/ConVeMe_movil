import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompraInsumo } from './entities/compra-insumo.entity';
import { CreateCompraInsumoInput } from './dto/create-compra-insumo.input';
import { UpdateCompraInsumoInput } from './dto/update-compra-insumo.input';

@Injectable()
export class ComprasInsumosService {
    constructor(
        @InjectRepository(CompraInsumo)
        private readonly compraRepository: Repository<CompraInsumo>,
    ) {}

    async create(createCompraInput: CreateCompraInsumoInput): Promise<CompraInsumo> {
        const nuevaCompra = this.compraRepository.create(createCompraInput);
        const guardada = await this.compraRepository.save(nuevaCompra);
        return this.findOne(guardada.id_compra_insumo);
    }

    async findAll(): Promise<CompraInsumo[]> {
        return this.compraRepository.find({
            relations: ['empleado', 'detalles', 'detalles.insumo']
        });
    }

    async findOne(id_compra_insumo: number): Promise<CompraInsumo> {
        const compra = await this.compraRepository.findOne({
            where: { id_compra_insumo },
            relations: ['empleado', 'detalles', 'detalles.insumo'],
        });
        if (!compra) throw new NotFoundException(`Compra #${id_compra_insumo} no encontrada`);
        return compra;
    }

    async update(id_compra_insumo: number, updateCompraInput: UpdateCompraInsumoInput): Promise<CompraInsumo> {
        const compra = await this.findOne(id_compra_insumo);


        Object.assign(compra, updateCompraInput);

        await this.compraRepository.save(compra);
        return this.findOne(id_compra_insumo);
    }

    async remove(id_compra_insumo: number): Promise<boolean> {
        const resultado = await this.compraRepository.delete(id_compra_insumo);
        return (resultado.affected ?? 0) > 0;
    }
}
