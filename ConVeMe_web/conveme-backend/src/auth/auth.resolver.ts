import { Resolver, Mutation, Query, Args, Int } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthResponse } from './dto/auth-response.type';
import { LoginInput } from './dto/login.input';
// Importaciones de seguridad (opcionales para esta ruta, pero recomendadas)
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';

@Resolver()
export class AuthResolver {
    constructor(private readonly authService: AuthService) {}

    // Mutación que recibe credenciales y devuelve el token y usuario.
    @Mutation(() => AuthResponse)
    login(@Args('loginInput') loginInput: LoginInput) {
        return this.authService.login(loginInput);
    }

    // 👇 AQUÍ ESTÁ LA NUEVA QUERY QUE EL FRONTEND ESTÁ BUSCANDO 👇

    // @UseGuards(JwtAuthGuard, RolesGuard) // <- Descomenta esto si quieres exigir JWT para validar
    // @Roles(1) // <- Descomenta esto para exigir que solo el Admin pueda usar esta ruta
    @Query(() => Boolean, { name: 'validarPasswordAdmin' })
    validarPasswordAdmin(
        @Args('id_usuario', { type: () => Int }) id_usuario: number,
                         @Args('password') password_raw: string
    ) {
        return this.authService.validarPasswordAdmin(id_usuario, password_raw);
    }
}
