import { Test, TestingModule } from '@nestjs/testing';
import { PedidosResolver } from './pedidos.resolver';

describe('PedidosResolver', () => {
  let resolver: PedidosResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PedidosResolver],
    }).compile();

    resolver = module.get<PedidosResolver>(PedidosResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
