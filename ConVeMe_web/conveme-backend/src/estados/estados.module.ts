import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadosService } from './estados.service';
import { EstadosResolver } from './estados.resolver';
import { Estado } from './estado.entity';

@Module({

  imports: [TypeOrmModule.forFeature([Estado])],
        providers: [EstadosResolver, EstadosService],
        exports: [EstadosService],
})
export class EstadosModule {}
