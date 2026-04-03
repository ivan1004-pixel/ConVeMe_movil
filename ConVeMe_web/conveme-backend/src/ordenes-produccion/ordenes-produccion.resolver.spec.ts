import { Test, TestingModule } from '@nestjs/testing';
import { OrdenesProduccionResolver } from './ordenes-produccion.resolver';

describe('OrdenesProduccionResolver', () => {
  let resolver: OrdenesProduccionResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrdenesProduccionResolver],
    }).compile();

    resolver = module.get<OrdenesProduccionResolver>(OrdenesProduccionResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
