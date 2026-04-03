import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            // Extrae el token del header "Authorization: Bearer <token>"
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
              ignoreExpiration: false,
              // La misma clave secreta que usaremos en el módulo
              secretOrKey: 'CONVEME_SECRET_KEY_SUPER_SEGURA',
        });
    }

    //  Si el token es válido, este método decodifica el payload y lo inyecta en el objeto Request para que sepamos quién está haciendo la petición.
    async validate(payload: any) {
        return { id_usuario: payload.sub, username: payload.username, rol_id: payload.rol_id };
    }
}
