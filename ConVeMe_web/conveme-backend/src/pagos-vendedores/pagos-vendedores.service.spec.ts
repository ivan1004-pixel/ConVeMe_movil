import { Test, TestingModule } from '@nestjs/testing';
import { PagosVendedoresService } from './pagos-vendedores.service';

describe('PagosVendedoresService', () => {
  let service: PagosVendedoresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PagosVendedoresService],
    }).compile();

    service = module.get<PagosVendedoresService>(PagosVendedoresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
