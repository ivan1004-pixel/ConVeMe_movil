import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriasService } from './categorias.service';
import { CategoriasResolver } from './categorias.resolver';
import { Categoria } from './categoria.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Categoria])],
        providers: [CategoriasResolver, CategoriasService],
        exports: [CategoriasService],
})
export class CategoriasModule {}
