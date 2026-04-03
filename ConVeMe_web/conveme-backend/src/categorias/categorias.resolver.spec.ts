import { Test, TestingModule } from '@nestjs/testing';
import { CategoriasResolver } from './categorias.resolver';

describe('CategoriasResolver', () => {
  let resolver: CategoriasResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoriasResolver],
    }).compile();

    resolver = module.get<CategoriasResolver>(CategoriasResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
