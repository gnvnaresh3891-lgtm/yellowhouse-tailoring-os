import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { PrismaService } from './modules/prisma/prisma.service';
import { MeasurementsService } from './modules/measurements/measurements.service';
import { MeasurementsController } from './modules/measurements/measurements.controller';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    OnboardingModule,
    AuthModule,
  ],
  controllers: [MeasurementsController],
  providers: [PrismaService, MeasurementsService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
