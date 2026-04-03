import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PagoVendedor } from './pago-vendedor.entity';
import { CreatePagoVendedorInput } from './dto/create-pago-vendedor.input';
import { UpdatePagoVendedorInput } from './dto/update-pago-vendedor.input';

@Injectable()
export class PagosVendedoresService {
    constructor(
        @InjectRepository(PagoVendedor)
        private readonly pagoRepository: Repository<PagoVendedor>,
    ) {}

    async create(createPagoInput: CreatePagoVendedorInput): Promise<PagoVendedor> {
        const nuevo = this.pagoRepository.create(createPagoInput);
        const guardado = await this.pagoRepository.save(nuevo);
        return this.findOne(guardado.id_pago);
    }

    async findAll(): Promise<PagoVendedor[]> {
        return this.pagoRepository.find({ relations: ['vendedor'] });
    }

    async findOne(id_pago: number): Promise<PagoVendedor> {
        const pago = await this.pagoRepository.findOne({
            where: { id_pago },
            relations: ['vendedor'],
        });
        if (!pago) throw new NotFoundException(`Pago #${id_pago} no encontrado`);
        return pago;
    }

    async update(id_pago: number, updatePagoInput: UpdatePagoVendedorInput): Promise<PagoVendedor> {
        const pago = await this.findOne(id_pago);
        Object.assign(pago, updatePagoInput);
        await this.pagoRepository.save(pago);
        return this.findOne(id_pago);
    }

    async remove(id_pago: number): Promise<boolean> {
        const resultado = await this.pagoRepository.delete(id_pago);
        return (resultado.affected ?? 0) > 0;
    }
}
