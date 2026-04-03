import { Test, TestingModule } from '@nestjs/testing';
import { AsignacionesVendedorService } from './asignaciones-vendedor.service';

describe('AsignacionesVendedorService', () => {
  let service: AsignacionesVendedorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AsignacionesVendedorService],
    }).compile();

    service = module.get<AsignacionesVendedorService>(AsignacionesVendedorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
