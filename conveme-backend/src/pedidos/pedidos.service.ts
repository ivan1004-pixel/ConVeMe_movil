import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from './entities/pedido.entity';
import { CreatePedidoInput } from './dto/create-pedido.input';
import { UpdatePedidoInput } from './dto/update-pedido.input';

@Injectable()
export class PedidosService {
    constructor(
        @InjectRepository(Pedido)
        private readonly pedidoRepository: Repository<Pedido>,
    ) {}

    async create(createPedidoInput: CreatePedidoInput): Promise<Pedido> {
        const nuevo = this.pedidoRepository.create(createPedidoInput);
        const guardado = await this.pedidoRepository.save(nuevo);
        return this.findOne(guardado.id_pedido);
    }

    async findAll(): Promise<Pedido[]> {
        return this.pedidoRepository.find({
            relations: ['cliente', 'detalles', 'detalles.producto', 'vendedor']
        });
    }

    async findOne(id_pedido: number): Promise<Pedido> {
        const pedido = await this.pedidoRepository.findOne({
            where: { id_pedido },
            // 👇 ¡AQUÍ ESTABA EL DETALLE! Agregamos 'vendedor' a la lista
            relations: ['cliente', 'detalles', 'detalles.producto', 'vendedor'],
        });
        if (!pedido) throw new NotFoundException(`Pedido #${id_pedido} no encontrado`);
        return pedido;
    }

    async update(id_pedido: number, updatePedidoInput: UpdatePedidoInput): Promise<Pedido> {
        const pedido = await this.findOne(id_pedido);
        Object.assign(pedido, updatePedidoInput);
        await this.pedidoRepository.save(pedido);
        return this.findOne(id_pedido);
    }

    async remove(id_pedido: number): Promise<boolean> {
        const resultado = await this.pedidoRepository.delete(id_pedido);
        return (resultado.affected ?? 0) > 0;
    }
}
