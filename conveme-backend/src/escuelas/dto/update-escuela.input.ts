import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateEscuelaInput } from './create-escuela.input';

@InputType()
export class UpdateEscuelaInput extends PartialType(CreateEscuelaInput) {
    // 1. El ID es obligatorio para saber a quién vamos a actualizar
    @Field(() => Int)
    id_escuela: number;

    // 2. Aquí va el campo activa que te estaba marcando error
    @Field({ nullable: true })
    activa?: boolean;
}
