import { Test, TestingModule } from '@nestjs/testing';
import { SaldoVendedoresResolver } from './saldo-vendedores.resolver';

describe('SaldoVendedoresResolver', () => {
  let resolver: SaldoVendedoresResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SaldoVendedoresResolver],
    }).compile();

    resolver = module.get<SaldoVendedoresResolver>(SaldoVendedoresResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
