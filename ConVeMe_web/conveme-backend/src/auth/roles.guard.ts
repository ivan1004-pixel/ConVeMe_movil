import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        // Lee qué roles requiere la función
        const requiredRoles = this.reflector.getAllAndOverride<number[]>(ROLES_KEY, [
            context.getHandler(),
                                                                         context.getClass(),
        ]);

        if (!requiredRoles) {
            return true; // Si no pide roles específicos, pásale
        }

        // Extrae al usuario del request (el jwt.strategy lo puso ahí)
        const ctx = GqlExecutionContext.create(context);
        const { user } = ctx.getContext().req;

        // Verifica si el rol_id del usuario está en la lista VIP
        return requiredRoles.includes(user.rol_id);
    }
}
