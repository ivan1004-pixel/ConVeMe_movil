import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateEventoInput } from './create-evento.input';

@InputType()
export class UpdateEventoInput extends PartialType(CreateEventoInput) {
    @Field(() => Int)
    id_evento: number;
}
