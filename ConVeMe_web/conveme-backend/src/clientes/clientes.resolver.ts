import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ClientesService } from './clientes.service';
import { Cliente } from './cliente.entity';
import { CreateClienteInput } from './dto/create-cliente.input';
import { UpdateClienteInput } from './dto/update-cliente.input';

@Resolver(() => Cliente)
export class ClientesResolver {
  constructor(private readonly clientesService: ClientesService) {}

  @Mutation(() => Cliente)
  createCliente(@Args('createClienteInput') createClienteInput: CreateClienteInput) {
    return this.clientesService.create(createClienteInput);
  }

  @Query(() => [Cliente], { name: 'clientes' })
  findAll() {
    return this.clientesService.findAll();
  }

  // 👇 NUEVO: Exponemos el buscador para React
  @Query(() => [Cliente], { name: 'buscarClientes' })
  searchClientes(@Args('termino', { type: () => String, nullable: true }) termino?: string) {
    return this.clientesService.searchClientes(termino || '');
  }

  @Query(() => Cliente, { name: 'cliente' })
  findOne(@Args('id_cliente', { type: () => Int }) id_cliente: number) {
    return this.clientesService.findOne(id_cliente);
  }

  @Mutation(() => Cliente)
  updateCliente(@Args('updateClienteInput') updateClienteInput: UpdateClienteInput) {
    return this.clientesService.update(updateClienteInput.id_cliente, updateClienteInput);
  }

  @Mutation(() => Boolean)
  removeCliente(@Args('id_cliente', { type: () => Int }) id_cliente: number) {
    return this.clientesService.remove(id_cliente);
  }
}
