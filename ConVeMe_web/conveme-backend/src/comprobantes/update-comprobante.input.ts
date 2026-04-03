import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateComprobanteInput } from './create-comprobante.input';

@InputType()
export class UpdateComprobanteInput extends PartialType(CreateComprobanteInput) {
    @Field(() => Int)
    id_comprobante: number;
}
