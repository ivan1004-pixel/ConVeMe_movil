import { Test, TestingModule } from '@nestjs/testing';
import { InventarioProductosResolver } from './inventario-productos.resolver';

describe('InventarioProductosResolver', () => {
  let resolver: InventarioProductosResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InventarioProductosResolver],
    }).compile();

    resolver = module.get<InventarioProductosResolver>(InventarioProductosResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
