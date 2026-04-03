import { Test, TestingModule } from '@nestjs/testing';
import { ComprasInsumosService } from './compras-insumos.service';

describe('ComprasInsumosService', () => {
  let service: ComprasInsumosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComprasInsumosService],
    }).compile();

    service = module.get<ComprasInsumosService>(ComprasInsumosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
