import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(
    @Body() signInDto: SignInDto,
  ): Promise<{ access_token: string }> {
    return await this.authService.signIn(signInDto.email, signInDto.password);
  }

  @HttpCode(HttpStatus.OK)
  @Post('admin/login')
  async AdminsignIn(
    @Body() signInDto: SignInDto,
  ): Promise<{ access_token: string }> {
    return await this.authService.AdminsignIn(
      signInDto.email,
      signInDto.password,
    );
  }
}
