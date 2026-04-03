import { Test, TestingModule } from '@nestjs/testing';
import { BitacoraAuditoriaResolver } from './bitacora-auditoria.resolver';

describe('BitacoraAuditoriaResolver', () => {
  let resolver: BitacoraAuditoriaResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BitacoraAuditoriaResolver],
    }).compile();

    resolver = module.get<BitacoraAuditoriaResolver>(BitacoraAuditoriaResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
