import { Test, TestingModule } from '@nestjs/testing';
import { CortesVendedorResolver } from './cortes-vendedor.resolver';

describe('CortesVendedorResolver', () => {
  let resolver: CortesVendedorResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CortesVendedorResolver],
    }).compile();

    resolver = module.get<CortesVendedorResolver>(CortesVendedorResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
