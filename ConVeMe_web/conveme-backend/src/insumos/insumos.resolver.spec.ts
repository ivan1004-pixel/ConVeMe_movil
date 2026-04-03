import { Test, TestingModule } from '@nestjs/testing';
import { InsumosResolver } from './insumos.resolver';

describe('InsumosResolver', () => {
  let resolver: InsumosResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InsumosResolver],
    }).compile();

    resolver = module.get<InsumosResolver>(InsumosResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
