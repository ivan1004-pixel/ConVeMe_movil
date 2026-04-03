import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { LoginInput } from './dto/login.input';
import { AuthResponse } from './dto/auth-response.type';

@Injectable()
export class AuthService {
    constructor(
        private readonly usuariosService: UsuariosService,
            private readonly jwtService: JwtService,
    ) {}

    async login(loginInput: LoginInput): Promise<AuthResponse> {
        // 1. Buscamos al usuario en la base de datos
        const usuario = await this.usuariosService.findByUsername(loginInput.username);

        // Si no existe, lanzamos error de autorización genérico por seguridad
        if (!usuario) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        // 2. Comparamos la contraseña en texto plano con el hash guardado
        const isPasswordValid = await bcrypt.compare(loginInput.password_raw, usuario.password_hash);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        // 3. Creamos el payload del JWT (los datos que irán dentro del token)
        const payload = {
            sub: usuario.id_usuario, // 'sub' es el estándar para el ID del sujeto
            username: usuario.username,
            rol_id: usuario.rol_id
        };

        // 4. Firmamos el token y retornamos la respuesta
        return {
            token: this.jwtService.sign(payload),
            usuario,
        };
    }

    // 👇 AQUÍ ESTÁ LA NUEVA FUNCIÓN DE VALIDACIÓN PARA EL MODAL 👇
    async validarPasswordAdmin(id_usuario: number, passwordPlana: string): Promise<boolean> {
        try {
            // 1. Buscamos al usuario que está intentando autorizar
            const usuario = await this.usuariosService.findOne(id_usuario);

            if (!usuario) {
                return false;
            }

            // 2. Comparamos lo que escribió en el modal con su contraseña real encriptada
            const isPasswordValid = await bcrypt.compare(passwordPlana, usuario.password_hash);

            // 3. Si es válida y su rol es Administrador (asumiendo que 1 = Admin), retorna true
            if (isPasswordValid && usuario.rol_id === 1) {
                return true;
            }

            return false;
        } catch (error) {
            // Si hay un error (ej. el usuario fue borrado), no lo autoriza
            return false;
        }
    }
}
