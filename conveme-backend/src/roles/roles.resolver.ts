import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { RolesService } from './roles.service';
import { Rol } from './role.entity';
import { CreateRolInput } from './dto/create-rol.input';
import { UpdateRolInput } from './dto/update-rol.input';

@Resolver(() => Rol)
export class RolesResolver {
    constructor(private readonly rolesService: RolesService) {}

    @Mutation(() => Rol)
    createRol(@Args('createRolInput') createRolInput: CreateRolInput) {
        return this.rolesService.create(createRolInput);
    }

    @Query(() => [Rol], { name: 'roles' })
    findAll() {
        return this.rolesService.findAll();
    }

    @Query(() => Rol, { name: 'rol' })
    findOne(@Args('id_rol', { type: () => Int }) id_rol: number) {
        return this.rolesService.findOne(id_rol);
    }

    @Mutation(() => Rol)
    updateRol(@Args('updateRolInput') updateRolInput: UpdateRolInput) {
        return this.rolesService.update(updateRolInput.id_rol, updateRolInput);
    }

    @Mutation(() => Boolean)
    removeRol(@Args('id_rol', { type: () => Int }) id_rol: number) {
        return this.rolesService.remove(id_rol);
    }
}
