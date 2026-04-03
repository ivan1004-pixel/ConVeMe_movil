import { Test, TestingModule } from '@nestjs/testing';
import { PromocionesResolver } from './promociones.resolver';

describe('PromocionesResolver', () => {
  let resolver: PromocionesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PromocionesResolver],
    }).compile();

    resolver = module.get<PromocionesResolver>(PromocionesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
