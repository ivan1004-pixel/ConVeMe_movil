import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EscuelasService } from './escuelas.service';
import { EscuelasResolver } from './escuelas.resolver';
import { Escuela } from './escuela.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Escuela])],
        providers: [EscuelasResolver, EscuelasService],
        exports: [EscuelasService],
})
export class EscuelasModule {}
