import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Token de restablecimiento de contraseña',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({
    description: 'Nueva contraseña',
    example: '1234567890',
  })
  @IsNotEmpty()
  @IsStrongPassword()
  newPassword: string;

  @ApiProperty({
    description: 'Confirmación de la nueva contraseña',
    example: '1234567890',
  })
  @IsNotEmpty()
  @IsStrongPassword()
  confirmPassword: string;
}
