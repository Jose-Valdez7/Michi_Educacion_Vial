import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { CreateRegisterDto } from './dto/create-register.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class RegisterService {
	constructor(private prisma: PrismaService) {}

	async register(createRegisterDto: CreateRegisterDto) {
		const { username, cedula, password, nombre, apellido, birthDate, role, sex } = createRegisterDto;
		// Verificar si el usuario ya existe
		const existing = await this.prisma.child.findUnique({ where: { username } });
		if (existing) {
			throw new BadRequestException('El usuario ya existe');
		}
		// Hashear la contraseña
		const hashedPassword = await bcrypt.hash(password, 10);
		// Crear el usuario
		return this.prisma.child.create({
			data: {
				username,
				cedula,
				password: hashedPassword,
				name: `${nombre} ${apellido}`.trim(),
				birthDate: new Date(birthDate),
				role,
				sex,
			},
		});
	}
}
