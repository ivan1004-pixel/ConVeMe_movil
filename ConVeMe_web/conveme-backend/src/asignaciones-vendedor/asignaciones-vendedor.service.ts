import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AsignacionVendedor } from './entities/asignacion-vendedor.entity';
import { CreateAsignacionVendedorInput } from './dto/create-asignacion-vendedor.input';
import { UpdateAsignacionVendedorInput } from './dto/update-asignacion-vendedor.input';

@Injectable()
export class AsignacionesVendedorService {
    constructor(
        @InjectRepository(AsignacionVendedor)
        private readonly asignacionRepository: Repository<AsignacionVendedor>,
    ) {}

    async create(createAsignacionInput: CreateAsignacionVendedorInput): Promise<AsignacionVendedor> {
        const nueva = this.asignacionRepository.create(createAsignacionInput);
        const guardada = await this.asignacionRepository.save(nueva);
        return this.findOne(guardada.id_asignacion);
    }

    async findAll(search: string = ''): Promise<AsignacionVendedor[]> {
        const query = this.asignacionRepository.createQueryBuilder('asignacion')
        .leftJoinAndSelect('asignacion.vendedor', 'vendedor')
        .leftJoinAndSelect('asignacion.detalles', 'detalles')
        .leftJoinAndSelect('detalles.producto', 'producto');

        // Si el usuario escribió algo en la barra de búsqueda
        if (search.trim() !== '') {
            const isNumber = !isNaN(Number(search));
            if (isNumber) {
                query.where('asignacion.id_asignacion = :id', { id: Number(search) }); // Busca por Folio
            } else {
                query.where('vendedor.nombre_completo LIKE :search', { search: `%${search}%` }); // Busca por Vendedor
            }
        }

        return query.orderBy('asignacion.id_asignacion', 'DESC').take(50).getMany();
    }

    async findOne(id_asignacion: number): Promise<AsignacionVendedor> {
        const asignacion = await this.asignacionRepository.findOne({
            where: { id_asignacion },
            relations: ['vendedor', 'detalles', 'detalles.producto'],
        });
        if (!asignacion) throw new NotFoundException(`Asignación #${id_asignacion} no encontrada`);
        return asignacion;
    }

    async update(id_asignacion: number, updateAsignacionInput: UpdateAsignacionVendedorInput): Promise<AsignacionVendedor> {
        const asignacion = await this.findOne(id_asignacion);
        Object.assign(asignacion, updateAsignacionInput);
        await this.asignacionRepository.save(asignacion);
        return this.findOne(id_asignacion);
    }

    async remove(id_asignacion: number): Promise<boolean> {
        const resultado = await this.asignacionRepository.delete(id_asignacion);
        return (resultado.affected ?? 0) > 0;
    }
}
