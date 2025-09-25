import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RolesEnum, SexEnum } from '../../../modules/common/enums';

export class RegisterChildDto {
  @ApiProperty({
    description: 'Nombre completo del niño',
    example: 'Juan Pérez',
    minLength: 1,
  })
  @IsNotEmpty()
  @IsString()
  name: string;



  @ApiProperty({
    description: 'Cedula del niño',
    example: '1234567890',
    minLength: 10,
    maxLength: 10,
  })
  @IsString()
  @IsNotEmpty()
  @Length(10, 10)
  cedula: string;



  @ApiProperty({
    description: 'Nombre de usuario del niño',
    example: 'juanperez',
    minLength: 1,
  })
  @IsNotEmpty()
  @IsString()
  username: string;



  @ApiProperty({
    description: 'Fecha de nacimiento del niño',
    example: '2010-05-15',
  })
  @IsNotEmpty()
  @IsString()
  birthdate: string;

  @ApiProperty({
    description: 'Sexo del niño',
    example: 'MASCULINO',
  })
  @IsNotEmpty()
  @IsEnum(SexEnum, {
    message: 'El sexo debe ser uno de los valores definidos en SexEnum',
  })
  sex: SexEnum;



  @ApiProperty({
    description: 'Rol del niño',
    example: RolesEnum.CHILD,
  })
  @IsEnum(RolesEnum, {
    message: 'El rol debe ser uno de los valores definidos en RolesEnum',
  })
  @IsNotEmpty()
  role: RolesEnum;
}
