import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true; // Si no hay roles requeridos, permite el acceso
    }

    const { child } = context.switchToHttp().getRequest();

    if (!child) {
      return false; // No hay usuario autenticado
    }

    if (!child.roles || !Array.isArray(child.roles)) {
      return false; // El usuario no tiene roles
    }

    return requiredRoles.some((role) => child.roles.includes(role));
  }
}
