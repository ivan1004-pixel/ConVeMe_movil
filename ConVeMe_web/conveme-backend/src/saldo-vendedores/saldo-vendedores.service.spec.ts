import { Test, TestingModule } from '@nestjs/testing';
import { SaldoVendedoresService } from './saldo-vendedores.service';

describe('SaldoVendedoresService', () => {
  let service: SaldoVendedoresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SaldoVendedoresService],
    }).compile();

    service = module.get<SaldoVendedoresService>(SaldoVendedoresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
