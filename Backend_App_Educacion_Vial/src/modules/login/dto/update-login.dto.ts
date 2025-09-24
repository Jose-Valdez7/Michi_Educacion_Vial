import { PartialType } from '@nestjs/swagger';
import { CreateLoginDto } from './create-login.dto';
import { IsString, IsOptional } from 'class-validator';

class BaseUpdateLoginDto {
  @IsString()
  @IsOptional()
  userName?: string;

  @IsString()
  @IsOptional()
  cedula?: string;

  @IsString()
  @IsOptional()
  password?: string;
}

export class UpdateLoginDto extends PartialType(BaseUpdateLoginDto) {}
