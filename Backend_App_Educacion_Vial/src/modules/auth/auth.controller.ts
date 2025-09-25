import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { Role } from './enums/role.enums';
import { LoginChildDto, RegisterChildDto } from './dto';
import { Child } from './decorators/child.decorator';
import type { CurrentChild } from './interface/current-child.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 409, description: 'El usuario ya existe.' })
  @ApiBody({ type: RegisterChildDto })
  register(@Body() registerChildDto: RegisterChildDto) {
    return this.authService.register(registerChildDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: 200, description: 'Login exitoso.' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  @ApiBody({ type: LoginChildDto })
  login(@Body() loginChildDto: LoginChildDto) {
    return this.authService.login(loginChildDto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Renovar token de acceso' })
  @ApiResponse({ status: 200, description: 'Token renovado exitosamente.' })
  @ApiResponse({ status: 401, description: 'Refresh token inválido.' })
  @ApiBody({ type: RefreshTokenDto })
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Cerrar sesión' })
  @ApiResponse({ status: 200, description: 'Logout exitoso.' })
  @ApiResponse({ status: 401, description: 'Refresh token inválido.' })
  @ApiBody({ type: RefreshTokenDto })
  logout(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.logout(refreshTokenDto.refreshToken);
  }

  /*   @Get('profile')
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 200, description: 'Perfil del usuario.' })
  @ApiUnauthorizedResponse({ description: 'Token no válido.' })
  @UseGuards(AuthGuard)
  getProfile(@User() child: CurrentUser) {
    return child;
  }
 */
  @Post('cleanup-tokens')
  @ApiOperation({
    summary: 'Limpiar tokens revocados y expirados (Solo Admins)',
  })
  @ApiBearerAuth('access-token')
  @ApiResponse({
    status: 200,
    description: 'Tokens limpiados exitosamente.',
    schema: {
      example: {
        status: 200,
        message: 'Tokens limpiados exitosamente',
        data: { deletedCount: 15 },
        timestamp: '2024-08-25T10:30:00.000Z',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Token no válido.' })
  @ApiForbiddenResponse({ description: 'Sin permisos de administrador.' })
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  async cleanupTokens(@Child() child: CurrentChild) {
    const result = await this.authService.cleanupAllRevokedTokens();
    return {
      status: HttpStatus.OK,
      message: 'Tokens limpiados exitosamente',
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Solicitar restablecimiento de contraseña' })
  @ApiResponse({
    status: 200,
    description: 'Solicitud procesada exitosamente.',
    schema: {
      example: {
        status: 200,
        message:
          'Si el email existe, recibirás un enlace para restablecer tu contraseña',
        data: null,
        timestamp: '2024-08-25T10:30:00.000Z',
      },
    },
  })




  /**********  */
  /*@ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiBody({ type: ForgotPasswordDto })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Restablecer contraseña con token' })
  @ApiResponse({
    status: 200,
    description: 'Contraseña restablecida exitosamente.',
    schema: {
      example: {
        status: 200,
        message: 'Contraseña restablecida exitosamente',
        data: null,
        timestamp: '2024-08-25T10:30:00.000Z',
      },
    },
  })*/
  @ApiResponse({
    status: 400,
    description: 'Token inválido o datos incorrectos.',
  })
  @ApiBody({ type: ResetPasswordDto })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(resetPasswordDto);
  }
}
