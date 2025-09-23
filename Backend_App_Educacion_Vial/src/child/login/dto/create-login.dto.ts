import { IsString, IsNotEmpty } from 'class-validator';

export class CreateLoginDto {
  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsString()
  @IsNotEmpty()
  cedula: string;
}
