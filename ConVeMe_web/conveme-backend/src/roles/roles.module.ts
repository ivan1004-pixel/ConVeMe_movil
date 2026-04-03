import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesService } from './roles.service';
import { RolesResolver } from './roles.resolver';
import { Rol } from './role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rol])],
        providers: [RolesResolver, RolesService],
        exports: [RolesService],
})
export class RolesModule {}
