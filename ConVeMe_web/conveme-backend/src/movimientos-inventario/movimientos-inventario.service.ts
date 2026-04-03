import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MovimientoInventario } from './movimiento-inventario.entity';
import { CreateMovimientoInventarioInput } from './dto/create-movimiento-inventario.input';
import { UpdateMovimientoInventarioInput } from './dto/update-movimiento-inventario.input';

@Injectable()
export class MovimientosInventarioService {
    constructor(
        @InjectRepository(MovimientoInventario)
        private readonly movimientoRepository: Repository<MovimientoInventario>,
    ) {}

    async create(createMovimientoInput: CreateMovimientoInventarioInput): Promise<MovimientoInventario> {
        const nuevo = this.movimientoRepository.create(createMovimientoInput);
        const guardado = await this.movimientoRepository.save(nuevo);
        return this.findOne(guardado.id_movimiento);
    }

    async findAll(): Promise<MovimientoInventario[]> {
        return this.movimientoRepository.find({ relations: ['producto', 'empleado'] });
    }

    async findOne(id_movimiento: number): Promise<MovimientoInventario> {
        const movimiento = await this.movimientoRepository.findOne({
            where: { id_movimiento },
            relations: ['producto', 'empleado'],
        });
        if (!movimiento) throw new NotFoundException(`Movimiento #${id_movimiento} no encontrado`);
        return movimiento;
    }

    async update(id_movimiento: number, updateMovimientoInput: UpdateMovimientoInventarioInput): Promise<MovimientoInventario> {
        const movimiento = await this.findOne(id_movimiento);
        Object.assign(movimiento, updateMovimientoInput);
        await this.movimientoRepository.save(movimiento);
        return this.findOne(id_movimiento);
    }

    async remove(id_movimiento: number): Promise<boolean> {
        const resultado = await this.movimientoRepository.delete(id_movimiento);
        return (resultado.affected ?? 0) > 0;
    }
}
