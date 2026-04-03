import { Test, TestingModule } from '@nestjs/testing';
import { CategoriasGastoService } from './categorias-gasto.service';

describe('CategoriasGastoService', () => {
  let service: CategoriasGastoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoriasGastoService],
    }).compile();

    service = module.get<CategoriasGastoService>(CategoriasGastoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
