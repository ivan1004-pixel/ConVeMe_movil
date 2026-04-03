import { Test, TestingModule } from '@nestjs/testing';
import { EstadosResolver } from './estados.resolver';

describe('EstadosResolver', () => {
  let resolver: EstadosResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EstadosResolver],
    }).compile();

    resolver = module.get<EstadosResolver>(EstadosResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
