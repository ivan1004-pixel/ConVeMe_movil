import { Test, TestingModule } from '@nestjs/testing';
import { AsignacionesVendedorResolver } from './asignaciones-vendedor.resolver';

describe('AsignacionesVendedorResolver', () => {
  let resolver: AsignacionesVendedorResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AsignacionesVendedorResolver],
    }).compile();

    resolver = module.get<AsignacionesVendedorResolver>(AsignacionesVendedorResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
