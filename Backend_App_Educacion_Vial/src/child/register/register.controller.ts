import { Body, Controller, Post } from '@nestjs/common';
import { RegisterService } from './register.service';
import { CreateRegisterDto } from './dto/create-register.dto';

@Controller('child/register')
export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}

  @Post()
  register(@Body() dto: CreateRegisterDto) {
    return this.registerService.register(dto);
  }
}
