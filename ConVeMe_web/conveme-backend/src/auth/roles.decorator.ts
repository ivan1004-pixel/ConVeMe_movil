import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
// Recibe números porque en tu BD los roles son IDs (1 = Admin, 2 = Vendedor, etc.)
export const Roles = (...roles: number[]) => SetMetadata(ROLES_KEY, roles);
