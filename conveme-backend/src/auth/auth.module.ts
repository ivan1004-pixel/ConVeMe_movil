import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UsuariosModule, // Importamos UsuariosModule para usar el UsuariosService
    PassportModule,
    JwtModule.register({
      secret: 'CONVEME_SECRET_KEY_SUPER_SEGURA',
      signOptions: { expiresIn: '12h' }, // El token expirará en 12 horas
    }),
  ],
  providers: [AuthService, AuthResolver, JwtStrategy],
})
export class AuthModule {}
