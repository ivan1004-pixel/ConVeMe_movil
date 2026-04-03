import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Municipio } from './municipio.entity';
import { CreateMunicipioInput } from './dto/create-municipio.input';
import { UpdateMunicipioInput } from './dto/update-municipio.input';

@Injectable()
export class MunicipiosService {
    constructor(
        @InjectRepository(Municipio)
        private readonly municipioRepository: Repository<Municipio>,
    ) {}

    async create(createMunicipioInput: CreateMunicipioInput): Promise<Municipio> {
        const nuevoMunicipio = this.municipioRepository.create(createMunicipioInput);
        const guardado = await this.municipioRepository.save(nuevoMunicipio);

        // Retornamos el findOne para que traiga el árbol de relaciones
        return this.findOne(guardado.id_municipio);
    }

    async findAll(): Promise<Municipio[]> {
        return this.municipioRepository.find({ relations: ['estado', 'estado.pais'] });
    }

    async findOne(id_municipio: number): Promise<Municipio> {
        const municipio = await this.municipioRepository.findOne({
            where: { id_municipio },
            relations: ['estado', 'estado.pais'],
        });
        if (!municipio) throw new NotFoundException(`Municipio #${id_municipio} no encontrado`);
        return municipio;
    }

    async update(id_municipio: number, updateMunicipioInput: UpdateMunicipioInput): Promise<Municipio> {
        const municipio = await this.findOne(id_municipio);
        Object.assign(municipio, updateMunicipioInput);
        await this.municipioRepository.save(municipio);

        return this.findOne(id_municipio);
    }

    async remove(id_municipio: number): Promise<boolean> {
        const resultado = await this.municipioRepository.delete(id_municipio);
        return (resultado.affected ?? 0) > 0;
    }

    async findByEstadoId(estado_id: number): Promise<Municipio[]> {
        return this.municipioRepository.find({
            where: { estado_id: estado_id } // Esto busca todos los de Toluca, Lerma, etc.
        });
    }
}
