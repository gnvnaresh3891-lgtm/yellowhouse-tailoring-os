import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'yellowhouse-secret-key-2026',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [OnboardingController],
  providers: [OnboardingService, PrismaService],
  exports: [OnboardingService],
})
export class OnboardingModule {}
