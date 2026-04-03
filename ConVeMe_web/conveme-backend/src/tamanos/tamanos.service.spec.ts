import { Test, TestingModule } from '@nestjs/testing';
import { TamanosService } from './tamanos.service';

describe('TamanosService', () => {
  let service: TamanosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TamanosService],
    }).compile();

    service = module.get<TamanosService>(TamanosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
