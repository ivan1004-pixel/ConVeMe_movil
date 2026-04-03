import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComprobantesService } from './comprobantes.service';
import { ComprobantesResolver } from './comprobantes.resolver';
import { Comprobante } from './comprobante.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Comprobante])],
        providers: [ComprobantesResolver, ComprobantesService],
        exports: [ComprobantesService]
})
export class ComprobantesModule {}
