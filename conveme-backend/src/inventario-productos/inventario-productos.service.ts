import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventarioProducto } from './inventario-producto.entity';
import { CreateInventarioProductoInput } from './dto/create-inventario-producto.input';
import { UpdateInventarioProductoInput } from './dto/update-inventario-producto.input';

@Injectable()
export class InventarioProductosService {
    constructor(
        @InjectRepository(InventarioProducto)
        private readonly inventarioRepository: Repository<InventarioProducto>,
    ) {}

    async create(createInventarioInput: CreateInventarioProductoInput): Promise<InventarioProducto> {
        const nuevo = this.inventarioRepository.create(createInventarioInput);
        const guardado = await this.inventarioRepository.save(nuevo);
        return this.findOne(guardado.id_inventario);
    }

    async findAll(): Promise<InventarioProducto[]> {
        return this.inventarioRepository.find({ relations: ['producto'] });
    }

    async findOne(id_inventario: number): Promise<InventarioProducto> {
        const inventario = await this.inventarioRepository.findOne({
            where: { id_inventario },
            relations: ['producto'],
        });
        if (!inventario) throw new NotFoundException(`Inventario #${id_inventario} no encontrado`);
        return inventario;
    }

    async update(id_inventario: number, updateInventarioInput: UpdateInventarioProductoInput): Promise<InventarioProducto> {
        const inventario = await this.findOne(id_inventario);
        Object.assign(inventario, updateInventarioInput);
        await this.inventarioRepository.save(inventario);
        return this.findOne(id_inventario);
    }

    async remove(id_inventario: number): Promise<boolean> {
        const resultado = await this.inventarioRepository.delete(id_inventario);
        return (resultado.affected ?? 0) > 0;
    }
}
