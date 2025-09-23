import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginChildDto {
  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  userName: string;

  @ApiProperty({
    description: 'Cedula del usuario',
    example: '1234567890',
    minLength: 10,
    maxLength: 10,
  })
  @IsString()
  @IsNotEmpty()
  cedula: string;
}
