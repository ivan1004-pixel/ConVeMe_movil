import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venta } from './entities/venta.entity';
import { CreateVentaInput } from './dto/create-venta.input';
import { UpdateVentaInput } from './dto/update-venta.input';

@Injectable()
export class VentasService {
    constructor(
        @InjectRepository(Venta)
        private readonly ventaRepository: Repository<Venta>,
    ) {}

    async create(createVentaInput: CreateVentaInput): Promise<Venta> {
        // Validación: Una venta no puede estar vacía
        if (!createVentaInput.detalles || createVentaInput.detalles.length === 0) {
            throw new BadRequestException('La venta debe tener al menos un producto (detalle).');
        }

        // Ya no sobreescribimos el monto_total, respetamos el que envía el POS
        // (el cual ya trae el descuento de la promoción aplicado).
        const nuevaVenta = this.ventaRepository.create(createVentaInput);

        // Al guardar, TypeORM guardará la Venta y los DetVenta automáticamente
        const guardada = await this.ventaRepository.save(nuevaVenta);

        return this.findOne(guardada.id_venta);
    }

    async findAll(): Promise<Venta[]> {
        return this.ventaRepository.find({
            relations: ['cliente', 'vendedor', 'detalles', 'detalles.producto']
        });
    }

    async findOne(id_venta: number): Promise<Venta> {
        const venta = await this.ventaRepository.findOne({
            where: { id_venta },
            relations: ['cliente', 'vendedor', 'detalles', 'detalles.producto'],
        });
        if (!venta) throw new NotFoundException(`Venta #${id_venta} no encontrada`);
        return venta;
    }

    async update(id_venta: number, updateVentaInput: UpdateVentaInput): Promise<Venta> {
        // 👇 SOLUCIÓN: Solo le pasamos el updateVentaInput, porque ya trae el id_venta por dentro
        const venta = await this.ventaRepository.preload(updateVentaInput);

        if (!venta) throw new NotFoundException(`Venta #${id_venta} no encontrada`);

        await this.ventaRepository.save(venta);
        return this.findOne(id_venta);
    }

    async remove(id_venta: number): Promise<boolean> {
        // En ventas, rara vez se borra permanentemente por temas contables,
        // pero como es la función remove base, la dejaremos como la pusiste.
        const resultado = await this.ventaRepository.delete(id_venta);
        return (resultado.affected ?? 0) > 0;
    }
}
