import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    console.log('🔐 AuthGuard verificando token:', {
      hasAuthorizationHeader: !!request.headers.authorization,
      authorizationHeader: request.headers.authorization,
      extractedToken: token ? 'present' : 'missing',
      path: request.path,
      method: request.method
    });

    if (!token) {
      console.log('❌ AuthGuard: Token no encontrado');
      throw new UnauthorizedException('Token not found');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
      });

      console.log('✅ AuthGuard: Token válido para child:', payload.id);

      request['token'] = token;
      // attach current child info for downstream usage
      request['child'] = {
        id: payload.id,
        roles: payload.roles,
      };
    } catch (error) {
      console.log('❌ AuthGuard: Token inválido:', error.message);
      throw new UnauthorizedException('Invalid token');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
