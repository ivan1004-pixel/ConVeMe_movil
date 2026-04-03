import { Test, TestingModule } from '@nestjs/testing';
import { PagosVendedoresResolver } from './pagos-vendedores.resolver';

describe('PagosVendedoresResolver', () => {
  let resolver: PagosVendedoresResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PagosVendedoresResolver],
    }).compile();

    resolver = module.get<PagosVendedoresResolver>(PagosVendedoresResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
