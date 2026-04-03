import { ObjectType, Field } from '@nestjs/graphql';
import { Usuario } from '../../usuarios/usuario.entity';

@ObjectType()
export class AuthResponse {
    //  Retornamos el token JWT para que el frontend lo guarde y lo envíe en cada petición futura.
    @Field()
    token: string;

    //  También devolvemos los datos del usuario logueado para pintar su nombre/rol en la interfaz de NoManchesMx.
    @Field(() => Usuario)
    usuario: Usuario;
}
