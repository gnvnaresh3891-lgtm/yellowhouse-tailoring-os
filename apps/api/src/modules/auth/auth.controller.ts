import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, CreateTenantDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('onboard-tenant')
  createTenant(@Body() dto: CreateTenantDto) {
    return this.authService.createTenant(dto);
  }

  @Get('check-slug')
  checkSlug(@Query('slug') slug: string) {
    return this.authService.checkSlugAvailability(slug);
  }

  @Get('tenants')
  getAllTenants() {
    return this.authService.getAllTenants();
  }
}
