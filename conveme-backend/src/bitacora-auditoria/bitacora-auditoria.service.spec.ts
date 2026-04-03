import { Test, TestingModule } from '@nestjs/testing';
import { BitacoraAuditoriaService } from './bitacora-auditoria.service';

describe('BitacoraAuditoriaService', () => {
  let service: BitacoraAuditoriaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BitacoraAuditoriaService],
    }).compile();

    service = module.get<BitacoraAuditoriaService>(BitacoraAuditoriaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
