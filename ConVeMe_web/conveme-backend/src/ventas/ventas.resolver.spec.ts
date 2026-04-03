import { Test, TestingModule } from '@nestjs/testing';
import { VentasResolver } from './ventas.resolver';

describe('VentasResolver', () => {
  let resolver: VentasResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VentasResolver],
    }).compile();

    resolver = module.get<VentasResolver>(VentasResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
