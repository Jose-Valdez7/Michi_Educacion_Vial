import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { CreateLoginDto } from './dto/create-login.dto';
import { UpdateLoginDto } from './dto/update-login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LoginService {
  constructor(private prisma: PrismaService) {}

  async create(createLoginDto: CreateLoginDto) {
    try {
      const { userName, cedula } = createLoginDto;

      // Buscar el usuario en la base de datos
      const child = await this.prisma.child.findFirst({
        where: {
          OR: [
            { username: userName },
            { cedula: cedula }
          ]
        }
      });

      if (!child) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      // Verificar la contraseña (comparar cédula con el hash almacenado)
      const isPasswordValid = await bcrypt.compare(cedula, child.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      // Retornar información del usuario sin la contraseña
      const { password, ...userWithoutPassword } = child;
      return {
        success: true,
        message: 'Login exitoso',
        data: userWithoutPassword
      };
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      return await this.prisma.child.findMany({
        select: {
          id: true,
          name: true,
          username: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });
    } catch (error) {
      throw new BadRequestException('Error al obtener usuarios');
    }
  }

  async findOne(id: number) {
    try {
      const child = await this.prisma.child.findUnique({
        where: { id: id.toString() },
        select: {
          id: true,
          name: true,
          username: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!child) {
        throw new BadRequestException('Usuario no encontrado');
      }

      return child;
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateLoginDto: UpdateLoginDto) {
    try {
      const updateData: any = { ...updateLoginDto };

      if (updateLoginDto.password) {
        updateData.password = await bcrypt.hash(updateLoginDto.password, 10);
      }

      return await this.prisma.child.update({
        where: { id: id.toString() },
        data: updateData,
        select: {
          id: true,
          name: true,
          username: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });
    } catch (error) {
      throw new BadRequestException('Error al actualizar usuario');
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.child.delete({
        where: { id: id.toString() },
        select: {
          id: true,
          name: true,
          username: true
        }
      });
    } catch (error) {
      throw new BadRequestException('Error al eliminar usuario');
    }
  }
}
