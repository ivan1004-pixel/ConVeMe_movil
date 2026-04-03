import { Test, TestingModule } from '@nestjs/testing';
import { GastosOperativosResolver } from './gastos-operativos.resolver';

describe('GastosOperativosResolver', () => {
  let resolver: GastosOperativosResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GastosOperativosResolver],
    }).compile();

    resolver = module.get<GastosOperativosResolver>(GastosOperativosResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
