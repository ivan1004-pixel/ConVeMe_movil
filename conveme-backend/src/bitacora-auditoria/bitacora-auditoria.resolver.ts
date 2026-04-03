import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { BitacoraAuditoriaService } from './bitacora-auditoria.service';
import { BitacoraAuditoria } from './entities/bitacora-auditoria.entity';
import { CreateBitacoraAuditoriaInput } from './dto/create-bitacora-auditoria.input';

@Resolver(() => BitacoraAuditoria)
export class BitacoraAuditoriaResolver {
    constructor(private readonly bitacoraAuditoriaService: BitacoraAuditoriaService) {}

    @Mutation(() => BitacoraAuditoria)
    createBitacoraAuditoria(@Args('createBitacoraAuditoriaInput') createInput: CreateBitacoraAuditoriaInput) {
        return this.bitacoraAuditoriaService.create(createInput);
    }

    @Query(() => [BitacoraAuditoria], { name: 'bitacoraAuditorias' })
    findAll() {
        return this.bitacoraAuditoriaService.findAll();
    }

    @Query(() => BitacoraAuditoria, { name: 'bitacoraAuditoria' })
    findOne(@Args('id_auditoria', { type: () => Int }) id_auditoria: number) {
        return this.bitacoraAuditoriaService.findOne(id_auditoria);
    }
}
