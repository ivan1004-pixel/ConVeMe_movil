import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaisesService } from './paises.service';
import { PaisesResolver } from './paises.resolver';
import { Pais } from './pais.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pais])],
        providers: [PaisesResolver, PaisesService],
        exports: [PaisesService],
})
export class PaisesModule {}
