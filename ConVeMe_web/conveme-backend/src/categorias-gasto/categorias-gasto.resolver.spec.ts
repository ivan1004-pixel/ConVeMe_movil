import { Test, TestingModule } from '@nestjs/testing';
import { CategoriasGastoResolver } from './categorias-gasto.resolver';

describe('CategoriasGastoResolver', () => {
  let resolver: CategoriasGastoResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoriasGastoResolver],
    }).compile();

    resolver = module.get<CategoriasGastoResolver>(CategoriasGastoResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
