import { Test, TestingModule } from '@nestjs/testing';
import { EscuelasResolver } from './escuelas.resolver';

describe('EscuelasResolver', () => {
  let resolver: EscuelasResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EscuelasResolver],
    }).compile();

    resolver = module.get<EscuelasResolver>(EscuelasResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
