import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BitacoraAuditoriaService } from './bitacora-auditoria.service';
import { BitacoraAuditoriaResolver } from './bitacora-auditoria.resolver';
import { BitacoraAuditoria } from './entities/bitacora-auditoria.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BitacoraAuditoria])],
        providers: [BitacoraAuditoriaResolver, BitacoraAuditoriaService],
        exports: [BitacoraAuditoriaService],
})
export class BitacoraAuditoriaModule {}
