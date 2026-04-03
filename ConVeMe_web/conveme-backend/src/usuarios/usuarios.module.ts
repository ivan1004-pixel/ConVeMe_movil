import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosService } from './usuarios.service';
import { UsuariosResolver } from './usuarios.resolver';
import { Usuario } from './usuario.entity';

@Module({

  imports: [TypeOrmModule.forFeature([Usuario])],
        providers: [UsuariosResolver, UsuariosService],
        exports: [UsuariosService],
})
export class UsuariosModule {}
