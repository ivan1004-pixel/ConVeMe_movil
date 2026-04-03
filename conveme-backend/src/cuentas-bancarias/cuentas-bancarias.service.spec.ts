import { Test, TestingModule } from '@nestjs/testing';
import { CuentasBancariasService } from './cuentas-bancarias.service';

describe('CuentasBancariasService', () => {
  let service: CuentasBancariasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CuentasBancariasService],
    }).compile();

    service = module.get<CuentasBancariasService>(CuentasBancariasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
