import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaldoVendedor } from './saldo-vendedor.entity';
import { CreateSaldoVendedorInput } from './dto/create-saldo-vendedor.input';
import { UpdateSaldoVendedorInput } from './dto/update-saldo-vendedor.input';

@Injectable()
export class SaldoVendedoresService {
    constructor(
        @InjectRepository(SaldoVendedor)
        private readonly saldoRepository: Repository<SaldoVendedor>,
    ) {}

    async create(createSaldoInput: CreateSaldoVendedorInput): Promise<SaldoVendedor> {
        const nuevo = this.saldoRepository.create(createSaldoInput);
        const guardado = await this.saldoRepository.save(nuevo);
        return this.findOne(guardado.id_saldo);
    }

    async findAll(): Promise<SaldoVendedor[]> {
        return this.saldoRepository.find({ relations: ['vendedor'] });
    }

    async findOne(id_saldo: number): Promise<SaldoVendedor> {
        const saldo = await this.saldoRepository.findOne({
            where: { id_saldo },
            relations: ['vendedor'],
        });
        if (!saldo) throw new NotFoundException(`Saldo #${id_saldo} no encontrado`);
        return saldo;
    }

    async update(id_saldo: number, updateSaldoInput: UpdateSaldoVendedorInput): Promise<SaldoVendedor> {
        const saldo = await this.findOne(id_saldo);
        Object.assign(saldo, updateSaldoInput);
        await this.saldoRepository.save(saldo);
        return this.findOne(id_saldo);
    }

    async remove(id_saldo: number): Promise<boolean> {
        const resultado = await this.saldoRepository.delete(id_saldo);
        return (resultado.affected ?? 0) > 0;
    }
}
