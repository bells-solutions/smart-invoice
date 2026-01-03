import { Controller, Post, Body, ValidationPipe, Param } from "@nestjs/common";
import { AuthService } from "./auth.service";
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from "./auth.dto";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  async register(@Body(ValidationPipe) registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post("login")
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post("forgot-password")
  async forgotPassword(
    @Body(ValidationPipe) forgotPasswordDto: ForgotPasswordDto
  ) {
    return this.authService.requestPasswordReset(forgotPasswordDto.email);
  }

  @Post("reset-password")
  async resetPassword(
    @Body(ValidationPipe) resetPasswordDto: ResetPasswordDto
  ) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.password
    );
  }

  @Post("verify-email/:token")
  async verifyEmail(@Param("token") token: string) {
    return this.authService.verifyEmail(token);
  }
}
