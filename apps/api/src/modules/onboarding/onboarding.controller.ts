import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { SignupDto } from './dto/signup.dto';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get('check-slug/:slug')
  async checkSlug(@Param('slug') slug: string) {
    return this.onboardingService.checkSlug(slug);
  }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() dto: SignupDto) {
    return this.onboardingService.signup(dto);
  }
}
