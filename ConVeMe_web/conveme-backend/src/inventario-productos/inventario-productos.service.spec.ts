import { Test, TestingModule } from '@nestjs/testing';
import { InventarioProductosService } from './inventario-productos.service';

describe('InventarioProductosService', () => {
  let service: InventarioProductosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InventarioProductosService],
    }).compile();

    service = module.get<InventarioProductosService>(InventarioProductosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
