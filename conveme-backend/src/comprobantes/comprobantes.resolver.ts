import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ComprobantesService } from './comprobantes.service';
import { Comprobante } from './comprobante.entity';
import { CreateComprobanteInput } from './create-comprobante.input';
import { UpdateComprobanteInput } from './update-comprobante.input';

@Resolver(() => Comprobante)
export class ComprobantesResolver {
    constructor(private readonly comprobantesService: ComprobantesService) {}

    @Mutation(() => Comprobante)
    createComprobante(@Args('createComprobanteInput') createComprobanteInput: CreateComprobanteInput) {
        return this.comprobantesService.create(createComprobanteInput);
    }

    @Query(() => [Comprobante], { name: 'comprobantes' })
    findAll() {
        return this.comprobantesService.findAll();
    }

    @Query(() => [Comprobante], { name: 'comprobantesPorVendedor' })
    findByVendedor(@Args('vendedor_id', { type: () => Int }) vendedor_id: number) {
        return this.comprobantesService.findByVendedor(vendedor_id);
    }

    @Query(() => Comprobante, { name: 'comprobante' })
    findOne(@Args('id', { type: () => Int }) id: number) {
        return this.comprobantesService.findOne(id);
    }

    @Mutation(() => Comprobante)
    updateComprobante(@Args('updateComprobanteInput') updateInput: UpdateComprobanteInput) {
        return this.comprobantesService.update(updateInput.id_comprobante, updateInput);
    }

    @Mutation(() => Boolean)
    removeComprobante(@Args('id', { type: () => Int }) id: number) {
        return this.comprobantesService.remove(id);
    }
}
