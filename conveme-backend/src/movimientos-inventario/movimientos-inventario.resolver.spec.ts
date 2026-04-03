import { Test, TestingModule } from '@nestjs/testing';
import { MovimientosInventarioResolver } from './movimientos-inventario.resolver';

describe('MovimientosInventarioResolver', () => {
  let resolver: MovimientosInventarioResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MovimientosInventarioResolver],
    }).compile();

    resolver = module.get<MovimientosInventarioResolver>(MovimientosInventarioResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
