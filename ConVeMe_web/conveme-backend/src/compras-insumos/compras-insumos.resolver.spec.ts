import { Test, TestingModule } from '@nestjs/testing';
import { ComprasInsumosResolver } from './compras-insumos.resolver';

describe('ComprasInsumosResolver', () => {
  let resolver: ComprasInsumosResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComprasInsumosResolver],
    }).compile();

    resolver = module.get<ComprasInsumosResolver>(ComprasInsumosResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
