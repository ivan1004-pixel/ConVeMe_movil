import { Test, TestingModule } from '@nestjs/testing';
import { CuentasBancariasResolver } from './cuentas-bancarias.resolver';

describe('CuentasBancariasResolver', () => {
  let resolver: CuentasBancariasResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CuentasBancariasResolver],
    }).compile();

    resolver = module.get<CuentasBancariasResolver>(CuentasBancariasResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
