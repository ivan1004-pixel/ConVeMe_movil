import { Test, TestingModule } from '@nestjs/testing';
import { GastosOperativosService } from './gastos-operativos.service';

describe('GastosOperativosService', () => {
  let service: GastosOperativosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GastosOperativosService],
    }).compile();

    service = module.get<GastosOperativosService>(GastosOperativosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
