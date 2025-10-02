import {
  BadRequestException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LoginChildDto, RegisterChildDto } from './dto';
import { PrismaService } from '../common/database/prisma.service';
import {
  ResourceAlreadyExistsException,
  UsernameNotFoundException,
} from 'src/common/exceptions';
import { BaseResponseDto } from 'src/common/dtos/response.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  async register(
    registerChildDto: RegisterChildDto,
  ): Promise<BaseResponseDto<any>> {
    try {
      const { cedula, name, role, birthdate, sex } = registerChildDto;

      // Generar username automáticamente SIEMPRE
      let username: string;
      {
        const normalizedName = (name || '')
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z\s]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        const base = normalizedName.replace(/\s+/g, '');

        const date = new Date(birthdate);
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yy = String(date.getFullYear()).slice(-2);
        const suffix = `${dd}${mm}${yy}`;

        let candidate = `${base}${suffix}`.slice(0, 20);

        let counter = 0;
        while (true) {
          const exists = await this.prismaService.child.findFirst({
            where: { username: candidate },
            select: { id: true },
          });
          if (!exists) break;
          counter += 1;
          const counterStr = String(counter).padStart(2, '0');
          const baseMax = 20 - counterStr.length;
          candidate = `${base}${suffix}`.slice(0, baseMax) + counterStr;
        }
        username = candidate;
      }

      // Verificar si el usuario ya existe (por cédula)
      const existingUser = await this.prismaService.child.findUnique({
        where: { cedula },
      });

      if (existingUser) {
        throw new ResourceAlreadyExistsException(
          'El usuario con esta cédula ya existe',
        );
      }

      // Crear el usuario en la base de datos
      const newChild = await this.prismaService.child.create({
        data: {
          cedula,
          password: await bcrypt.hash(cedula, 10),
          role: [role],
          name: name,
          birthDate: new Date(birthdate),
          username: username,
          sex: [sex],
        },
      });

      await this.cleanupRevokedTokens(newChild.id);

      const tokens = await this.generateTokens(newChild);

      const childResponse = {
        child: {
          id: newChild.id,
          name: newChild.name,
          roles: newChild.role,
          cedula: newChild.cedula,
          userName: newChild.username,
          birthdate: newChild.birthDate,
          sex: newChild.sex,
        },
        ...tokens,
      };

      return {
        status: HttpStatus.CREATED,
        message: 'Usuario registrado exitosamente',
        data: childResponse,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof ResourceAlreadyExistsException) {
        throw error;
      }
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error registrando usuario',
        data: null,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async login(loginChildDto: LoginChildDto): Promise<BaseResponseDto<any>> {
    try {
      const { cedula, userName } = loginChildDto;

      // Buscar el usuario en la base de datos
      const child = await this.prismaService.child.findUnique({
        where: { cedula },
      });

      if (!child) {
        throw new UsernameNotFoundException('Credenciales inválidas');
      }

      // Verificar contraseña (comparamos contra el hash almacenado en password)
      const isPasswordValid = await bcrypt.compare(cedula, child.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      // Limpiar tokens revocados antes de generar nuevos tokens
      await this.cleanupRevokedTokens(child.id);

      const tokens = await this.generateTokens(child);

      const childResponse = {
        child: {
          id: child.id,
          name: child.name,
          roles: child.role,
          cedula: child.cedula,
          userName: child.username,
          birthdate: child.birthDate,
          sex: child.sex,
        },
        ...tokens,
      };

      return {
        status: HttpStatus.OK,
        message: 'Inicio de sesión exitoso',
        data: childResponse,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof UsernameNotFoundException) {
        throw error;
      }
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error en inicio de sesión',
        data: null,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      // Verificar el refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'your_refresh_secret',
      });

      // Verificar que es un refresh token
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Tipo de token inválido');
      }

      // Buscar todos los refresh tokens del usuario que no estén revocados
      const storedTokens = await this.prismaService.refreshToken.findMany({
        where: {
          childId: payload.id,
          isRevoked: false,
        },
        include: { child: true },
      });

      // Buscar el token que coincida
      let matchedToken: (typeof storedTokens)[0] | null = null;
      for (const storedToken of storedTokens) {
        const isMatch = await bcrypt.compare(refreshToken, storedToken.token);
        if (isMatch) {
          matchedToken = storedToken;
          break;
        }
      }

      // Si no existe o está revocado, es inválido
      if (!matchedToken) {
        throw new UnauthorizedException(
          'Token de actualización inválido o revocado',
        );
      }

      // Verificar si ha expirado
      if (new Date() > matchedToken.expiresAt) {
        // Marcar como revocado si ha expirado
        await this.prismaService.refreshToken.update({
          where: { id: matchedToken.id },
          data: { isRevoked: true },
        });
        throw new UnauthorizedException('Token de actualización expirado');
      }

      // Revocar el refresh token usado (one-time use)
      await this.prismaService.refreshToken.update({
        where: { id: matchedToken.id },
        data: { isRevoked: true },
      });

      // Generar nuevos tokens
      const child = matchedToken.child;
      const tokens = await this.generateTokens(child);

      return {
        status: HttpStatus.OK,
        message: 'Tokens renovados exitosamente',
        data: {
          child: {
            id: child.id,
            name: child.name,
            roles: child.role,
            cedula: child.cedula,
            userName: child.username,
            birthdate: child.birthDate,
            sex: child.sex,
          },
          ...tokens,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
    }
  }

  async logout(refreshToken: string) {
    try {
      if (!refreshToken) {
        throw new BadRequestException('Token de actualización requerido');
      }

      // Buscar todos los refresh tokens que no estén revocados
      const storedTokens = await this.prismaService.refreshToken.findMany({
        where: {
          isRevoked: false,
        },
      });

      // Buscar el token que coincida
      let matchedToken: (typeof storedTokens)[0] | null = null;
      for (const storedToken of storedTokens) {
        const isMatch = await bcrypt.compare(refreshToken, storedToken.token);
        if (isMatch) {
          matchedToken = storedToken;
          break;
        }
      }

      if (matchedToken) {
        // Revocar el refresh token
        await this.prismaService.refreshToken.update({
          where: { id: matchedToken.id },
          data: { isRevoked: true },
        });
      }

      return {
        status: HttpStatus.OK,
        message: 'Sesión cerrada exitosamente',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new BadRequestException('Error cerrando sesión');
    }
  }

  private async generateTokens(child: any) {
    const payload = {
      id: child.id,
      name: child.name,
      roles: child.role,
      cedula: child.cedula,
      userName: child.username,
      birthdate: child.birthDate,
      sex: child.sex,
    };

    // Access Token (corta duración)
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET || 'your_jwt_secret',
      expiresIn: '60m', // 60 minutos
    });

    // Refresh Token (larga duración)
    const refreshToken = await this.jwtService.signAsync(
      {
        ...payload,
        type: 'refresh', // Marca que es un refresh token
      },
      {
        secret: process.env.JWT_REFRESH_SECRET || 'your_refresh_secret',
        expiresIn: '7d', // 7 días
      },
    );

    // Guardar el refresh token hasheado en la base de datos
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 días

    await this.prismaService.refreshToken.create({
      data: {
        token: hashedRefreshToken,
        childId: child.id,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 60 * 60, // 60 minutos en segundos
    };
  }

  private async cleanupRevokedTokens(userId: string): Promise<void> {
    try {
      const now = new Date();

      // Eliminar tokens que están revocados O que han expirado
      const deletedTokens = await this.prismaService.refreshToken.deleteMany({
        where: {
          childId: userId,
          OR: [
            { isRevoked: true }, // Tokens revocados
            { expiresAt: { lt: now } }, // Tokens expirados
          ],
        },
      });
    } catch (error) {
      throw new BadRequestException('Error limpiando tokens revocados');
    }
  }

  async cleanupAllRevokedTokens(): Promise<{ deletedCount: number }> {
    try {
      const now = new Date();

      // Eliminar todos los tokens revocados o expirados de todos los usuarios
      const deletedTokens = await this.prismaService.refreshToken.deleteMany({
        where: {
          OR: [
            { isRevoked: true }, // Tokens revocados
            { expiresAt: { lt: now } }, // Tokens expirados
          ],
        },
      });

      return { deletedCount: deletedTokens.count };
    } catch (error) {
      throw new BadRequestException('Error en limpieza de tokens');
    }
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<BaseResponseDto<any>> {
    try {
      const { token, newPassword, confirmPassword } = resetPasswordDto;

      if (newPassword !== confirmPassword) {
        throw new BadRequestException('Las contraseñas no coinciden');
      }

      // Buscar el token en la base de datos
      const passwordResetToken =
        await this.prismaService.passwordResetToken.findUnique({
          where: { token },
          include: { child: true },
        });

      if (!passwordResetToken) {
        throw new BadRequestException('Token de restablecimiento inválido');
      }

      if (passwordResetToken.used) {
        throw new BadRequestException('Token de restablecimiento ya utilizado');
      }

      if (new Date() > passwordResetToken.expiresAt) {
        throw new BadRequestException('Token de restablecimiento expirado');
      }

      // Verificar que la nueva contraseña sea diferente de la actual
      const isSamePassword = await bcrypt.compare(
        newPassword,
        passwordResetToken.child.cedula,
      );
      if (isSamePassword) {
        throw new BadRequestException(
          'La nueva contraseña debe ser diferente de la actual',
        );
      }

      // Hashear la nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Actualizar la contraseña del usuario
      await this.prismaService.child.update({
        where: { id: passwordResetToken.childId },
        data: { cedula: hashedPassword },
      });

      // Marcar el token como usado
      await this.prismaService.passwordResetToken.update({
        where: { id: passwordResetToken.id },
        data: { used: true },
      });

      // Invalidar todos los refresh tokens del usuario por seguridad
      await this.prismaService.refreshToken.updateMany({
        where: { childId: passwordResetToken.childId },
        data: { isRevoked: true },
      });

      return {
        status: HttpStatus.OK,
        message: 'Contraseña restablecida exitosamente',
        data: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error restableciendo la contraseña');
    }
  }

  /*   async validateUser(payload: any): Promise<CurrentUser> {
    // Aquí puedes hacer validaciones adicionales si es necesario
    return {
      id: payload.id,
      email: payload.email,
      roles: payload.roles || ['child'], // Asegura que siempre tenga roles
    };
  } */
}
