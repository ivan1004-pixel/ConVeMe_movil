import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendedor } from './vendedor.entity';
import { CreateVendedorInput } from './dto/create-vendedor.input';
import { UpdateVendedorInput } from './dto/update-vendedor.input';

@Injectable()
export class VendedoresService {
    constructor(
        @InjectRepository(Vendedor)
        private readonly vendedorRepository: Repository<Vendedor>,
    ) {}

    async create(createVendedorInput: CreateVendedorInput): Promise<Vendedor> {
        // 1. Validar Usuario repetido
        const vendedorExistente = await this.vendedorRepository.findOne({
            where: { usuario_id: createVendedorInput.usuario_id }
        });
        if (vendedorExistente) throw new ConflictException(`El Usuario ID #${createVendedorInput.usuario_id} ya tiene un perfil de vendedor asignado.`);

        // 2. Validar Correo repetido
        const emailExistente = await this.vendedorRepository.findOne({
            where: { email: createVendedorInput.email }
        });
        if (emailExistente) throw new ConflictException(`El correo ${createVendedorInput.email} ya pertenece a otro vendedor.`);

        // 3. Validar Teléfono repetido
        if (createVendedorInput.telefono) {
            const telExistente = await this.vendedorRepository.findOne({
                where: { telefono: createVendedorInput.telefono }
            });
            if (telExistente) throw new ConflictException(`El teléfono ${createVendedorInput.telefono} ya está registrado en otro perfil.`);
        }

        // Si pasa todas las pruebas, lo creamos
        const nuevo = this.vendedorRepository.create(createVendedorInput);
        const guardado = await this.vendedorRepository.save(nuevo);
        return this.findOne(guardado.id_vendedor);
    }

    async findAll(): Promise<Vendedor[]> {
        return this.vendedorRepository.find({
            // 👇 Agregamos 'municipio.estado' aquí
            relations: ['usuario', 'escuela', 'municipio', 'municipio.estado']
        });
    }

    async findOne(id_vendedor: number): Promise<Vendedor> {
        const vendedor = await this.vendedorRepository.findOne({
            where: { id_vendedor },
            // 👇 Y también aquí
            relations: ['usuario', 'escuela', 'municipio', 'municipio.estado'],
        });
        if (!vendedor) throw new NotFoundException(`Vendedor #${id_vendedor} no encontrado`);
        return vendedor;
    }

    async update(id_vendedor: number, updateVendedorInput: UpdateVendedorInput): Promise<Vendedor> {
        const vendedor = await this.vendedorRepository.preload(updateVendedorInput);

        if (!vendedor) throw new NotFoundException(`Vendedor #${id_vendedor} no encontrado`);

        await this.vendedorRepository.save(vendedor);
        return this.findOne(id_vendedor);
    }

    async remove(id_vendedor: number): Promise<Vendedor> {
        const vendedorABorrar = await this.findOne(id_vendedor); // Lo buscamos antes de borrarlo
        await this.vendedorRepository.delete(id_vendedor);
        return vendedorABorrar; // Devolvemos los datos del que acabamos de borrar
    }

    async findByUsuarioId(usuario_id: number): Promise<Vendedor | null> {
        const vendedor = await this.vendedorRepository.findOne({
            where: { usuario_id },
            relations: ['usuario', 'escuela', 'municipio', 'municipio.estado'],
        });
        return vendedor;
    }

    async searchVendedores(termino: string = ''): Promise<Vendedor[]> {
        const query = this.vendedorRepository.createQueryBuilder('vendedor');

        // Si escribieron algo, filtramos. Si no, nos saltamos el WHERE y trae todos.
        if (termino.trim() !== '') {
            query.where('vendedor.nombre_completo LIKE :termino', { termino: `%${termino}%` });
        }

        return query.orderBy('vendedor.id_vendedor', 'DESC').take(20).getMany();
    }
}
