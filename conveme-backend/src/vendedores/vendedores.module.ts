import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendedoresService } from './vendedores.service';
import { VendedoresResolver } from './vendedores.resolver';
import { Vendedor } from './vendedor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vendedor])],
        providers: [VendedoresResolver, VendedoresService],
        exports: [VendedoresService],
})
export class VendedoresModule {}
