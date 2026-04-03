import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromocionesService } from './promociones.service';
import { PromocionesResolver } from './promociones.resolver';
import { Promocion } from './promocion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Promocion])],
        providers: [PromocionesResolver, PromocionesService],
        exports: [PromocionesService],
})
export class PromocionesModule {}
