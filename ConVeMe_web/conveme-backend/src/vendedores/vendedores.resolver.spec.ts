import { Test, TestingModule } from '@nestjs/testing';
import { VendedoresResolver } from './vendedores.resolver';

describe('VendedoresResolver', () => {
  let resolver: VendedoresResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VendedoresResolver],
    }).compile();

    resolver = module.get<VendedoresResolver>(VendedoresResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
