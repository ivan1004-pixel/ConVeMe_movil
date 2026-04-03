import { Test, TestingModule } from '@nestjs/testing';
import { MunicipiosResolver } from './municipios.resolver';

describe('MunicipiosResolver', () => {
  let resolver: MunicipiosResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MunicipiosResolver],
    }).compile();

    resolver = module.get<MunicipiosResolver>(MunicipiosResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
