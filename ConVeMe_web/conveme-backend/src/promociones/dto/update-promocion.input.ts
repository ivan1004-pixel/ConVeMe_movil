import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreatePromocionInput } from './create-promocion.input';

@InputType()
export class UpdatePromocionInput extends PartialType(CreatePromocionInput) {
    @Field(() => Int)
    id_promocion: number;
}
