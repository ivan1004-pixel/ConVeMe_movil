import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriaGasto } from './entities/categoria-gasto.entity';
import { CreateCategoriaGastoInput } from './dto/create-categoria-gasto.input';
import { UpdateCategoriaGastoInput } from './dto/update-categoria-gasto.input';

@Injectable()
export class CategoriasGastoService {
    constructor(
        @InjectRepository(CategoriaGasto)
        private readonly categoriaRepository: Repository<CategoriaGasto>,
    ) {}

    async create(createCategoriaInput: CreateCategoriaGastoInput): Promise<CategoriaGasto> {
        const nueva = this.categoriaRepository.create(createCategoriaInput);
        return this.categoriaRepository.save(nueva);
    }

    async findAll(): Promise<CategoriaGasto[]> {
        return this.categoriaRepository.find();
    }

    async findOne(id_categoria: number): Promise<CategoriaGasto> {
        const categoria = await this.categoriaRepository.findOne({ where: { id_categoria } });
        if (!categoria) throw new NotFoundException(`Categoría #${id_categoria} no encontrada`);
        return categoria;
    }

    async update(id_categoria: number, updateCategoriaInput: UpdateCategoriaGastoInput): Promise<CategoriaGasto> {
        const categoria = await this.findOne(id_categoria);
        Object.assign(categoria, updateCategoriaInput);
        return this.categoriaRepository.save(categoria);
    }

    async remove(id_categoria: number): Promise<boolean> {
        const resultado = await this.categoriaRepository.delete(id_categoria);
        return (resultado.affected ?? 0) > 0;
    }
}
