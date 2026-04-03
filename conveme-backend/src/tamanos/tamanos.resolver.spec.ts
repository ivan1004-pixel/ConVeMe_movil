import { Test, TestingModule } from '@nestjs/testing';
import { TamanosResolver } from './tamanos.resolver';

describe('TamanosResolver', () => {
  let resolver: TamanosResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TamanosResolver],
    }).compile();

    resolver = module.get<TamanosResolver>(TamanosResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
