import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsEnum, MinLength, MaxLength } from 'class-validator';
import { RolesEnum, SexEnum } from '../../../shared/enums';

export class CreateRegisterDto {
  @ApiProperty({ example: 'Juan', description: 'Nombre del niño' })
  @IsString()
  @MinLength(2)
  nombre: string;

  @ApiProperty({ example: 'Pérez', description: 'Apellido del niño' })
  @IsString()
  @MinLength(2)
  apellido: string;

  @ApiProperty({ example: '2012-05-15', description: 'Fecha de nacimiento' })
  @IsDateString()
  birthDate: string;


  @ApiProperty({ example: '1755646732', description: 'Número de cédula' })
  @IsString()
  @MinLength(8)
  @MaxLength(12)
  cedula: string;

  @ApiProperty({ example: 'juan2012', description: 'Nombre de usuario generado' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'CHILD', enum: RolesEnum, description: 'Rol del usuario' })
  @IsEnum(RolesEnum, { each: true })
  role: RolesEnum[];

  @ApiProperty({ example: 'MALE', enum: SexEnum, description: 'Sexo del niño' })
  @IsEnum(SexEnum, { each: true })
  sex: SexEnum[];

  @ApiProperty({ example: '12345678', description: 'Contraseña (número de cédula)' })
  @IsString()
  @MinLength(8)
  @MaxLength(12)
  password: string;
}
