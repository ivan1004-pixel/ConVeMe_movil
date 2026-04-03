import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { Usuario } from './usuario.entity';
import { CreateUsuarioInput } from './dto/create-usuario.input';
import { UpdateUsuarioInput } from './dto/update-usuario.input';

// 👇 YA PODEMOS IMPORTARLOS PORQUE YA EXISTEN
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Resolver(() => Usuario)
export class UsuariosResolver {
    constructor(private readonly usuariosService: UsuariosService) {}

    // 👇 ACTIVAMOS EL MURO DE CONCRETO
    // Pedimos Token y revisamos roles.
    // Usamos el número 1 porque es el ID del Administrador en tu BD
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(1)
    @Mutation(() => Usuario)
    createUsuario(@Args('createUsuarioInput') createUsuarioInput: CreateUsuarioInput) {
        return this.usuariosService.create(createUsuarioInput);
    }

    @Query(() => [Usuario], { name: 'usuarios' })
    findAll() {
        return this.usuariosService.findAll();
    }

    @Query(() => Usuario, { name: 'usuario' })
    findOne(@Args('id_usuario', { type: () => Int }) id_usuario: number) {
        return this.usuariosService.findOne(id_usuario);
    }

    @Mutation(() => Usuario)
    updateUsuario(@Args('updateUsuarioInput') updateUsuarioInput: UpdateUsuarioInput) {
        return this.usuariosService.update(updateUsuarioInput.id_usuario, updateUsuarioInput);
    }

    @Mutation(() => Boolean)
    removeUsuario(@Args('id_usuario', { type: () => Int }) id_usuario: number) {
        return this.usuariosService.remove(id_usuario);
    }
}
