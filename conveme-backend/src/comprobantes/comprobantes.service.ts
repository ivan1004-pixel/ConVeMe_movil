import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comprobante } from './comprobante.entity';
import { CreateComprobanteInput } from './create-comprobante.input';

@Injectable()
export class ComprobantesService {
    constructor(
        @InjectRepository(Comprobante)
        private readonly comprobanteRepository: Repository<Comprobante>,
    ) {}

    async create(createComprobanteInput: CreateComprobanteInput): Promise<Comprobante> {
        const nuevo = this.comprobanteRepository.create(createComprobanteInput);
        const guardado = await this.comprobanteRepository.save(nuevo);
        return this.findOne(guardado.id_comprobante);
    }

    async findAll(): Promise<Comprobante[]> {
        // 👇 LÍMITE DURO: Los 50 comprobantes más recientes en todo el ERP (Vista Admin)
        return this.comprobanteRepository.find({
            relations: ['vendedor', 'admin'],
            order: { fecha_corte: 'DESC' },
            take: 50
        });
    }

    async findByVendedor(vendedor_id: number): Promise<Comprobante[]> {
        // 👇 LÍMITE DURO: Los últimos 30 comprobantes de un VENDEDOR ESPECÍFICO
        return this.comprobanteRepository.find({
            where: { vendedor_id },
            relations: ['vendedor', 'admin'],
            order: { fecha_corte: 'DESC' },
            take: 30
        });
    }

    async findOne(id_comprobante: number): Promise<Comprobante> {
        const comprobante = await this.comprobanteRepository.findOne({
            where: { id_comprobante },
            relations: ['vendedor', 'admin'],
        });
        if (!comprobante) throw new NotFoundException(`Comprobante #${id_comprobante} no encontrado`);
        return comprobante;
    }

    async update(id_comprobante: number, updateInput: any): Promise<Comprobante> {
        const comprobante = await this.findOne(id_comprobante);
        Object.assign(comprobante, updateInput);

        // Recalcular saldo pendiente si modifican montos
        if (updateInput.total_vendido !== undefined || updateInput.comision_vendedor !== undefined || updateInput.monto_entregado !== undefined) {
            const debe = Number(comprobante.total_vendido) - Number(comprobante.comision_vendedor);
            comprobante.saldo_pendiente = debe - Number(comprobante.monto_entregado);
        }

        await this.comprobanteRepository.save(comprobante);
        return this.findOne(id_comprobante);
    }

    async remove(id_comprobante: number): Promise<boolean> {
        const resultado = await this.comprobanteRepository.delete(id_comprobante);
        return (resultado.affected ?? 0) > 0;
    }
}
