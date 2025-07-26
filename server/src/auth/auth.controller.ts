import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { BaseResponse } from '../types/common.type';
import { LoginResponseDto } from './dto/login-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() body: { username: string; password: string },
  ): Promise<BaseResponse<any>> {
    return this.authService.register(body.username, body.password);
  }

  @Post('login')
  async login(
    @Body() body: { username: string; password: string },
  ): Promise<BaseResponse<LoginResponseDto>> {
    return this.authService.login(body.username, body.password);
  }
}
