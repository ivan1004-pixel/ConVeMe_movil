import { Test, TestingModule } from '@nestjs/testing';
import { CortesVendedorService } from './cortes-vendedor.service';

describe('CortesVendedorService', () => {
  let service: CortesVendedorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CortesVendedorService],
    }).compile();

    service = module.get<CortesVendedorService>(CortesVendedorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
