import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BitacoraAuditoria } from './entities/bitacora-auditoria.entity';
import { CreateBitacoraAuditoriaInput } from './dto/create-bitacora-auditoria.input';

@Injectable()
export class BitacoraAuditoriaService {
    constructor(
        @InjectRepository(BitacoraAuditoria)
        private readonly auditoriaRepo: Repository<BitacoraAuditoria>,
    ) {}

    async create(createInput: CreateBitacoraAuditoriaInput): Promise<BitacoraAuditoria> {
        const nueva = this.auditoriaRepo.create(createInput);
        return this.auditoriaRepo.save(nueva);
    }

    async findAll(): Promise<BitacoraAuditoria[]> {
        return this.auditoriaRepo.find({
            relations: ['empleado'],
            order: { fecha_hora: 'DESC' } // Lo más reciente primero
        });
    }

    async findOne(id_auditoria: number): Promise<BitacoraAuditoria> {
        const registro = await this.auditoriaRepo.findOne({
            where: { id_auditoria },
            relations: ['empleado'],
        });
        if (!registro) throw new NotFoundException(`Registro #${id_auditoria} no encontrado`);
        return registro;
    }
}
