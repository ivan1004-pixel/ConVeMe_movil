import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriasGastoService } from './categorias-gasto.service';
import { CategoriasGastoResolver } from './categorias-gasto.resolver';
import { CategoriaGasto } from './entities/categoria-gasto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CategoriaGasto])],
        providers: [CategoriasGastoResolver, CategoriasGastoService],
        exports: [CategoriasGastoService],
})
export class CategoriasGastoModule {}
