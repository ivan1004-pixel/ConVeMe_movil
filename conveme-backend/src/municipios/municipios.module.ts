import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MunicipiosService } from './municipios.service';
import { MunicipiosResolver } from './municipios.resolver';
import { Municipio } from './municipio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Municipio])],
        providers: [MunicipiosResolver, MunicipiosService],
        exports: [MunicipiosService],
})
export class MunicipiosModule {}
