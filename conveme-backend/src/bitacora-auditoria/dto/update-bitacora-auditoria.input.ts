import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateBitacoraAuditoriaInput } from './create-bitacora-auditoria.input';

@InputType()
export class UpdateBitacoraAuditoriaInput extends PartialType(CreateBitacoraAuditoriaInput) {
    @Field(() => Int)
    id_auditoria: number;
}
