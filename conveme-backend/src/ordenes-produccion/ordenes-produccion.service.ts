import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { OrdenProduccion } from './entities/orden-produccion.entity';
import { CreateOrdenProduccionInput } from './dto/create-orden-produccion.input';
import { UpdateOrdenProduccionInput } from './dto/update-orden-produccion.input';
import { Insumo } from '../insumos/insumo.entity';
import { InventarioProducto } from '../inventario-productos/inventario-producto.entity';

@Injectable()
export class OrdenesProduccionService {
    constructor(
        @InjectRepository(OrdenProduccion)
        private readonly ordenRepository: Repository<OrdenProduccion>,
            private readonly dataSource: DataSource // Necesario para transacciones
    ) {}

    // 1. CREAR ORDEN (Y RESTAR INSUMOS)
    async create(createOrdenInput: CreateOrdenProduccionInput): Promise<OrdenProduccion> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Creamos la orden en memoria
            const nuevaOrden = queryRunner.manager.create(OrdenProduccion, createOrdenInput);
            const ordenGuardada = await queryRunner.manager.save(OrdenProduccion, nuevaOrden);

            // Descontar Insumos del Stock
            for (const detalle of createOrdenInput.detalles) {
                const insumo = await queryRunner.manager.findOne(Insumo, { where: { id_insumo: detalle.insumo_id } });

                if (!insumo) {
                    throw new NotFoundException(`Insumo ID ${detalle.insumo_id} no encontrado`);
                }

                if (insumo.stock_actual < detalle.cantidad_consumida) {
                    throw new BadRequestException(`Stock insuficiente de ${insumo.nombre}. Tienes ${insumo.stock_actual} y pides ${detalle.cantidad_consumida}.`);
                }

                // Restar el stock
                insumo.stock_actual = Number(insumo.stock_actual) - Number(detalle.cantidad_consumida);
                await queryRunner.manager.save(Insumo, insumo);
            }

            await queryRunner.commitTransaction();
            return this.findOne(ordenGuardada.id_orden_produccion);

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    // 2. LEER TODAS
    async findAll(): Promise<OrdenProduccion[]> {
        return this.ordenRepository.find({
            relations: ['producto', 'empleado', 'detalles', 'detalles.insumo'],
            order: { fecha_orden: 'DESC' }
        });
    }

    // 3. LEER UNA
    async findOne(id_orden_produccion: number): Promise<OrdenProduccion> {
        const orden = await this.ordenRepository.findOne({
            where: { id_orden_produccion },
            relations: ['producto', 'empleado', 'detalles', 'detalles.insumo'],
        });
        if (!orden) throw new NotFoundException(`Orden #${id_orden_produccion} no encontrada`);
        return orden;
    }

    // 4. ACTUALIZAR (Y SUMAR INVENTARIO SI SE FINALIZA)
    async update(id_orden_produccion: number, updateOrdenInput: UpdateOrdenProduccionInput): Promise<OrdenProduccion> {
        const ordenActual = await this.findOne(id_orden_produccion);

        // Verificamos si la están cambiando a "Finalizada"
        const seEstaFinalizando = updateOrdenInput.estado === 'Finalizada' && ordenActual.estado !== 'Finalizada';

        // TypeORM preload mezcla la orden de la base de datos con los datos nuevos.
        const ordenModificada = await this.ordenRepository.preload(updateOrdenInput);

        // Le aseguramos a TypeScript que ordenModificada sí existe antes de guardar
        if (!ordenModificada) {
            throw new NotFoundException(`No se pudo preparar la orden #${id_orden_produccion}`);
        }

        await this.ordenRepository.save(ordenModificada);

        // Si se acaba de marcar como Finalizada, sumamos al inventario de ventas
        if (seEstaFinalizando) {
            let inventario = await this.dataSource.manager.findOne(InventarioProducto, {
                where: { producto_id: ordenActual.producto_id }
            });

            const cantidadAgregada = updateOrdenInput.cantidad_a_producir || ordenActual.cantidad_a_producir;

            // Si el producto no existía en el inventario, lo creamos
            if (!inventario) {
                inventario = this.dataSource.manager.create(InventarioProducto, {
                    producto_id: ordenActual.producto_id,
                    stock_actual: cantidadAgregada,
                    stock_minimo_alerta: 10
                });
            } else {
                inventario.stock_actual = Number(inventario.stock_actual) + Number(cantidadAgregada);
            }

            await this.dataSource.manager.save(InventarioProducto, inventario);
        }

        return this.findOne(id_orden_produccion);
    }

    // 5. BORRAR
    async remove(id_orden_produccion: number): Promise<boolean> {
        const resultado = await this.ordenRepository.delete(id_orden_produccion);
        return (resultado.affected ?? 0) > 0;
    }
}
