import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CorteVendedor } from './entities/corte-vendedor.entity';
import { CreateCorteVendedorInput } from './dto/create-corte-vendedor.input';
import { UpdateCorteVendedorInput } from './dto/update-corte-vendedor.input';

@Injectable()
export class CortesVendedorService {
    constructor(
        @InjectRepository(CorteVendedor)
        private readonly corteRepository: Repository<CorteVendedor>,
    ) {}

    async create(createCorteInput: CreateCorteVendedorInput): Promise<CorteVendedor> {
        const nuevo = this.corteRepository.create(createCorteInput);
        const guardado = await this.corteRepository.save(nuevo);
        return this.findOne(guardado.id_corte);
    }

    // 👇 Búsqueda inteligente en el Backend
    async findAll(search: string = ''): Promise<CorteVendedor[]> {
        const query = this.corteRepository.createQueryBuilder('corte')
        .leftJoinAndSelect('corte.vendedor', 'vendedor')
        .leftJoinAndSelect('corte.asignacion', 'asignacion')
        .leftJoinAndSelect('corte.detalles', 'detalles')
        .leftJoinAndSelect('detalles.producto', 'producto');

        if (search.trim() !== '') {
            const isNumber = !isNaN(Number(search));
            if (isNumber) {
                query.where('corte.id_corte = :id', { id: Number(search) }); // Busca por Folio
            } else {
                query.where('vendedor.nombre_completo LIKE :search', { search: `%${search}%` }); // Busca por Vendedor
            }
        }

        return query.orderBy('corte.id_corte', 'DESC').take(50).getMany();
    }

    // 👇 NUEVO: Búsqueda segura para el panel "Mis Finanzas" del Vendedor
    async findByVendedor(vendedor_id: number): Promise<CorteVendedor[]> {
        return this.corteRepository.find({
            where: { vendedor_id },
            relations: ['vendedor', 'asignacion', 'detalles', 'detalles.producto'],
            take: 30, // Solo sus últimos 30 cortes
            order: { id_corte: 'DESC' }
        });
    }

    async findOne(id_corte: number): Promise<CorteVendedor> {
        const corte = await this.corteRepository.findOne({
            where: { id_corte },
            relations: ['vendedor', 'asignacion', 'detalles', 'detalles.producto'],
        });
        if (!corte) throw new NotFoundException(`Corte #${id_corte} no encontrado`);
        return corte;
    }

    async update(id_corte: number, updateCorteInput: UpdateCorteVendedorInput): Promise<CorteVendedor> {
        const corte = await this.findOne(id_corte);
        Object.assign(corte, updateCorteInput);
        await this.corteRepository.save(corte);
        return this.findOne(id_corte);
    }

    async remove(id_corte: number): Promise<boolean> {
        const resultado = await this.corteRepository.delete(id_corte);
        return (resultado.affected ?? 0) > 0;
    }
}
