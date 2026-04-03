import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateUsuarioInput {
    @Field()
    username: string;

    @Field()
    password_raw: string;

    @Field(() => Int, { nullable: true })
    rol_id?: number;

}
