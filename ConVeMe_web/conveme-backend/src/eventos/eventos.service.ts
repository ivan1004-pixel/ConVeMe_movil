import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evento } from './entities/evento.entity';
import { CreateEventoInput } from './dto/create-evento.input';
import { UpdateEventoInput } from './dto/update-evento.input';

@Injectable()
export class EventosService {
    constructor(
        @InjectRepository(Evento)
        private readonly eventoRepository: Repository<Evento>,
    ) {}

    async create(createEventoInput: CreateEventoInput): Promise<Evento> {
        const nuevo = this.eventoRepository.create(createEventoInput);
        const guardado = await this.eventoRepository.save(nuevo);
        return this.findOne(guardado.id_evento);
    }

    async findAll(): Promise<Evento[]> {
        return this.eventoRepository.find({
            where: { activo: true }, // Solo eventos activos
            relations: ['escuela', 'municipio', 'municipio.estado']
        });
    }

    async findOne(id_evento: number): Promise<Evento> {
        const evento = await this.eventoRepository.findOne({
            where: { id_evento },
            relations: ['escuela', 'municipio', 'municipio.estado']
        });
        if (!evento) throw new NotFoundException(`Evento #${id_evento} no encontrado`);
        return evento;
    }

    async update(id_evento: number, updateEventoInput: UpdateEventoInput): Promise<Evento> {
        const evento = await this.eventoRepository.preload(updateEventoInput);
        if (!evento) throw new NotFoundException(`Evento #${id_evento} no encontrado`);

        await this.eventoRepository.save(evento);
        return this.findOne(id_evento);
    }

    async remove(id_evento: number): Promise<Evento> {
        const evento = await this.findOne(id_evento);
        evento.activo = false; // Soft Delete
        await this.eventoRepository.save(evento);
        return evento;
    }
}
