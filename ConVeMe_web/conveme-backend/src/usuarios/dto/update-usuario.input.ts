import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateUsuarioInput } from './create-usuario.input';

@InputType()
export class UpdateUsuarioInput extends PartialType(CreateUsuarioInput) {
    @Field(() => Int)
    id_usuario: number;

    @Field({ nullable: true })
    username?: string;

    @Field({ nullable: true })
    password_raw?: string;

    @Field(() => Int, { nullable: true })
    rol_id?: number;
}
