# Milestone 1 Backend Technical Implementation Strategy Analysis Report

## Executive Summary
This document outlines the exact technical implementation strategy for **Milestone 1 Backend: Multi-Tenant Onboarding & Database Seeding Engine** of the YellowHouse Tailoring OS application.

The strategy specifies the design, file structure, class definitions, DTO validation decorators, service transaction logic, controller routing, module registration, and database seeding script necessary for establishing the multi-tenant onboarding foundation.

---

## 1. System Context & Architectural Scope

### 1.1 Architecture Overview
- **Framework**: NestJS 10 with Prisma ORM 5.
- **Database**: PostgreSQL / SQLite schema managed via `apps/api/prisma/schema.prisma`.
- **Module Target**: `apps/api/src/modules/onboarding`
- **Global Wiring**: `apps/api/src/app.module.ts`
- **Seeding Target**: `apps/api/prisma/seed.ts`

### 1.2 Database Schema Alignment
The database models referenced during onboarding and seeding in `schema.prisma`:
1. `Tenant`: Model storing tenant metadata (`id`, `name`, `slug`, `plan`, `status`).
2. `Branch`: Primary branch associated with tenant (`id`, `tenantId`, `name`, `city`, `isPrimary`).
3. `User`: Account record for boutique owner (`id`, `tenantId`, `branchId`, `name`, `email`, `passwordHash`, `role`).
4. `MeasurementTemplate`: System-wide or tenant-scoped measurement POM schemas (`id`, `tenantId`, `garmentName`, `gender`, `category`, `pomSchema`).

---

## 2. File Directory & Target Code Layout

The implementation for Milestone 1 Backend consists of 5 files within the API workspace:

```
apps/api/
├── prisma/
│   └── seed.ts                                  # Database seed script for global POM templates
└── src/
    ├── app.module.ts                            # Updated: Imports and registers OnboardingModule
    └── modules/
        └── onboarding/
            ├── onboarding.module.ts             # Module definition for onboarding feature
            ├── onboarding.controller.ts         # Routes: GET check-slug, POST signup
            ├── onboarding.service.ts            # Business logic & atomic transaction execution
            └── dto/
                └── signup.dto.ts                # DTO with class-validator annotations
```

---

## 3. Detailed Component Specifications

### 3.1 `SignupDto` Specification
- **File Path**: `apps/api/src/modules/onboarding/dto/signup.dto.ts`
- **Purpose**: Validates incoming payload for new boutique registration.
- **Fields & Decorators**:
  - `boutiqueName`: `@IsString()`, `@IsNotEmpty()`, `@MinLength(2)`
  - `tenantSlug`: `@IsString()`, `@IsNotEmpty()`, `@Matches(/^[a-z0-9-]+$/, { message: 'Slug must consist of lowercase letters, numbers, and hyphens only' })`
  - `ownerName`: `@IsString()`, `@IsNotEmpty()`, `@MinLength(2)`
  - `ownerEmail`: `@IsEmail()`, `@IsNotEmpty()`
  - `ownerPassword`: `@IsString()`, `@MinLength(6)`
  - `templateOptions`: `@IsOptional()`, `@IsArray()`, `@IsString({ each: true })` (e.g. `['mens', 'womens']`)

#### Proposed Code for `signup.dto.ts`:
```typescript
import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class SignupDto {
  @IsString()
  @IsNotEmpty({ message: 'Boutique name is required' })
  @MinLength(2, { message: 'Boutique name must be at least 2 characters' })
  boutiqueName: string;

  @IsString()
  @IsNotEmpty({ message: 'Tenant slug is required' })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must consist of lowercase alphanumeric characters and hyphens only (e.g., royal-tailors)',
  })
  tenantSlug: string;

  @IsString()
  @IsNotEmpty({ message: 'Owner name is required' })
  @MinLength(2, { message: 'Owner name must be at least 2 characters' })
  ownerName: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Owner email is required' })
  ownerEmail: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  ownerPassword: string;

  @IsOptional()
  @IsArray({ message: 'Template options must be an array of category strings' })
  @IsString({ each: true })
  templateOptions?: string[];
}
```

---

### 3.2 `OnboardingController` Specification
- **File Path**: `apps/api/src/modules/onboarding/onboarding.controller.ts`
- **Base Decorator**: `@Controller('onboarding')`
- **Endpoints**:
  1. `GET /onboarding/check-slug/:slug`
     - Validates format against slug regex (`^[a-z0-9-]+$`).
     - Calls `OnboardingService.checkSlug(slug)`.
     - Returns `{ available: boolean, slug: string, message?: string }`.
  2. `POST /onboarding/signup`
     - Decorators: `@Post('signup')`, `@HttpCode(HttpStatus.CREATED)`.
     - Accepts `@Body() dto: SignupDto`.
     - Calls `OnboardingService.signup(dto)`.
     - Returns created tenant profile, primary branch, and owner user details.

#### Proposed Code for `onboarding.controller.ts`:
```typescript
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
```

---

### 3.3 `OnboardingService` Specification
- **File Path**: `apps/api/src/modules/onboarding/onboarding.service.ts`
- **Dependencies**: `PrismaService` (injected via constructor), `bcryptjs` for password hashing.
- **Business Logic**:
  1. **`checkSlug(slug: string)`**:
     - Tests `slug` against regex `/^[a-z0-9-]+$/`. If invalid, returns `{ available: false, slug, message: 'Invalid slug format. Use lowercase letters, numbers, and hyphens.' }`.
     - Queries `this.prisma.tenant.findUnique({ where: { slug } })`.
     - If tenant exists: returns `{ available: false, slug, message: 'Slug is already taken' }`.
     - If free: returns `{ available: true, slug, message: 'Slug is available' }`.
  2. **`signup(dto: SignupDto)`**:
     - Pre-check 1: Check if `dto.tenantSlug` exists. If so, throw `ConflictException('Boutique slug is already taken')`.
     - Pre-check 2: Check if `dto.ownerEmail` exists in `User` table. If so, throw `ConflictException('Email address is already registered')`.
     - Password Hash: `const passwordHash = await bcrypt.hash(dto.ownerPassword, 10)`.
     - Transaction (`this.prisma.$transaction`):
       - Create `Tenant`: `{ name: dto.boutiqueName, slug: dto.tenantSlug, plan: 'starter', status: 'active' }`.
       - Create `Branch`: `{ tenantId: tenant.id, name: 'Main Branch', city: 'Headquarters', isPrimary: true }`.
       - Create `User`: `{ tenantId: tenant.id, branchId: branch.id, name: dto.ownerName, email: dto.ownerEmail.toLowerCase(), passwordHash, role: 'TENANT_OWNER' }`.
       - Seed Templates: Fetch global templates (`where: { tenantId: null }`). If `dto.templateOptions` is specified (e.g. `['mens']`, `['womens']`), filter templates by gender/category. Insert tenant-scoped records into `MeasurementTemplate` (`tenantId: tenant.id`).
     - Return Payload:
       ```json
       {
         "success": true,
         "tenant": { "id": "...", "name": "...", "slug": "...", "status": "active" },
         "branch": { "id": "...", "name": "Main Branch" },
         "user": { "id": "...", "name": "...", "email": "...", "role": "TENANT_OWNER" },
         "message": "Boutique onboarded successfully"
       }
       ```

#### Proposed Code for `onboarding.service.ts`:
```typescript
import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';

// Dynamic import or namespace import for bcryptjs
import * as bcrypt from 'bcryptjs';

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  async checkSlug(slug: string) {
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return {
        available: false,
        slug,
        message: 'Invalid slug format. Use lowercase alphanumeric characters and hyphens only.',
      };
    }

    const existingTenant = await this.prisma.tenant.findUnique({
      where: { slug: slug.toLowerCase() },
    });

    if (existingTenant) {
      return {
        available: false,
        slug,
        message: 'Slug is already taken.',
      };
    }

    return {
      available: true,
      slug,
      message: 'Slug is available.',
    };
  }

  async signup(dto: SignupDto) {
    const normalizedSlug = dto.tenantSlug.toLowerCase();
    const normalizedEmail = dto.ownerEmail.toLowerCase();

    // Regex check on slug
    if (!/^[a-z0-9-]+$/.test(normalizedSlug)) {
      throw new BadRequestException('Slug must consist of lowercase alphanumeric characters and hyphens only.');
    }

    // Verify slug uniqueness
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { slug: normalizedSlug },
    });
    if (existingTenant) {
      throw new ConflictException('Boutique slug is already taken. Please choose a different slug.');
    }

    // Verify user email uniqueness
    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      throw new ConflictException('Owner email is already registered. Please sign in or use a different email.');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.ownerPassword, 10);

    // Atomic transaction for Multi-Tenant Onboarding
    return await this.prisma.$transaction(async (tx) => {
      // 1. Create Tenant
      const tenant = await tx.tenant.create({
        data: {
          name: dto.boutiqueName,
          slug: normalizedSlug,
          plan: 'starter',
          status: 'active',
        },
      });

      // 2. Create Primary Branch
      const branch = await tx.branch.create({
        data: {
          tenantId: tenant.id,
          name: 'Main Branch',
          city: 'Headquarters',
          isPrimary: true,
        },
      });

      // 3. Create Tenant Owner User
      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          branchId: branch.id,
          name: dto.ownerName,
          email: normalizedEmail,
          passwordHash,
          role: 'TENANT_OWNER',
        },
      });

      // 4. Seed Tenant-scoped Measurement Templates if selected
      let seededTemplatesCount = 0;
      const globalTemplates = await tx.measurementTemplate.findMany({
        where: { tenantId: null },
      });

      if (globalTemplates.length > 0) {
        let templatesToCopy = globalTemplates;

        // If templateOptions filter is provided by user (e.g. ['mens', 'womens'])
        if (dto.templateOptions && dto.templateOptions.length > 0) {
          const selectedOpts = dto.templateOptions.map((o) => o.toLowerCase());
          templatesToCopy = globalTemplates.filter((gt) => {
            const genderMatch = selectedOpts.some((opt) => gt.gender.toLowerCase().includes(opt));
            const categoryMatch = selectedOpts.some((opt) => gt.category.toLowerCase().includes(opt));
            return genderMatch || categoryMatch || selectedOpts.includes('all') || selectedOpts.includes('custom');
          });
        }

        if (templatesToCopy.length > 0) {
          await tx.measurementTemplate.createMany({
            data: templatesToCopy.map((gt) => ({
              tenantId: tenant.id,
              garmentName: gt.garmentName,
              gender: gt.gender,
              category: gt.category,
              pomSchema: gt.pomSchema as any,
            })),
          });
          seededTemplatesCount = templatesToCopy.length;
        }
      }

      return {
        success: true,
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          status: tenant.status,
          plan: tenant.plan,
        },
        branch: {
          id: branch.id,
          name: branch.name,
        },
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        seededTemplatesCount,
        message: 'Boutique onboarded successfully.',
      };
    });
  }
}
```

---

### 3.4 `OnboardingModule` Specification
- **File Path**: `apps/api/src/modules/onboarding/onboarding.module.ts`
- **Providers & Imports**: Registers `OnboardingController`, `OnboardingService`, and `PrismaService`.

#### Proposed Code for `onboarding.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [OnboardingController],
  providers: [OnboardingService, PrismaService],
  exports: [OnboardingService],
})
export class OnboardingModule {}
```

---

### 3.5 `AppModule` Integration Specification
- **File Path**: `apps/api/src/app.module.ts`
- **Updates**: Register `OnboardingModule` in the `imports` array.

#### Proposed Code for `app.module.ts`:
```typescript
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { PrismaService } from './modules/prisma/prisma.service';
import { MeasurementsService } from './modules/measurements/measurements.service';
import { MeasurementsController } from './modules/measurements/measurements.controller';
import { OnboardingModule } from './modules/onboarding/onboarding.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    OnboardingModule,
  ],
  controllers: [MeasurementsController],
  providers: [PrismaService, MeasurementsService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
```

---

### 3.6 Database Seed Script Specification
- **File Path**: `apps/api/prisma/seed.ts`
- **Purpose**: Populates standard global measurement templates (`tenantId: null`) for Men's and Women's bespoke garments.
- **Key Categories**:
  - **Men's**: Bespoke 3-Piece Suit (Western), Royal Sherwani (Ethnic), Custom Dress Shirt (Western), Tailored Trouser (Western).
  - **Women's**: Sari Blouse (Ethnic), Lehenga Choli (Ethnic), Anarkali Suit (Ethnic), Structured Corset (Couture), Evening Gown (Couture).
- **Package Configuration**: Update `apps/api/package.json` to include:
  ```json
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
  ```

#### Proposed Code for `apps/api/prisma/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultTemplates = [
  {
    garmentName: "Men's Bespoke 3-Piece Suit",
    gender: "Men",
    category: "Western",
    pomSchema: [
      { id: "m-su-01", code: "M-SU-01", name: "Jacket Chest Circumference", category: "girth", baseMeasurement: 40.0, defaultEase: 3.5, tolerance: 0.25, landmarkId: "hs-mens-chest", unit: "in", validationRange: { min: 30.0, max: 60.0, step: 0.25 } },
      { id: "m-su-02", code: "M-SU-02", name: "Buttoning Waist Point", category: "girth", baseMeasurement: 34.0, defaultEase: 2.5, tolerance: 0.25, landmarkId: "hs-mens-waist", unit: "in", validationRange: { min: 26.0, max: 56.0, step: 0.25 } },
      { id: "m-su-03", code: "M-SU-03", name: "Hip / Seat Circumference", category: "girth", baseMeasurement: 41.0, defaultEase: 3.0, tolerance: 0.25, landmarkId: "hs-mens-hip", unit: "in", validationRange: { min: 32.0, max: 60.0, step: 0.25 } },
      { id: "m-su-04", code: "M-SU-04", name: "Shoulder Width (Acromion to Acromion)", category: "width", baseMeasurement: 18.0, defaultEase: 0.75, tolerance: 0.125, landmarkId: "hs-mens-shoulder", unit: "in", validationRange: { min: 14.0, max: 24.0, step: 0.25 } },
      { id: "m-su-05", code: "M-SU-05", name: "Center Back Jacket Length", category: "length", baseMeasurement: 30.0, defaultEase: 0.0, tolerance: 0.25, landmarkId: "hs-mens-jacket-len", unit: "in", validationRange: { min: 24.0, max: 38.0, step: 0.25 } },
      { id: "m-su-06", code: "M-SU-06", name: "Sleeve Length (Crown to Wrist)", category: "sleeve", baseMeasurement: 25.0, defaultEase: 0.5, tolerance: 0.25, landmarkId: "hs-mens-sleeve", unit: "in", validationRange: { min: 20.0, max: 32.0, step: 0.25 } },
      { id: "m-su-07", code: "M-SU-07", name: "Armscye / Armhole Depth", category: "width", baseMeasurement: 10.0, defaultEase: 1.0, tolerance: 0.25, landmarkId: "hs-mens-armscye", unit: "in", validationRange: { min: 7.0, max: 14.0, step: 0.25 } },
      { id: "m-su-08", code: "M-SU-08", name: "Bicep Circumference", category: "girth", baseMeasurement: 14.0, defaultEase: 2.0, tolerance: 0.25, landmarkId: "hs-mens-bicep", unit: "in", validationRange: { min: 10.0, max: 22.0, step: 0.25 } }
    ]
  },
  {
    garmentName: "Men's Royal Sherwani",
    gender: "Men",
    category: "Ethnic",
    pomSchema: [
      { id: "m-sh-01", code: "M-SH-01", name: "Chest Circumference", category: "girth", baseMeasurement: 40.0, defaultEase: 5.0, tolerance: 0.25, landmarkId: "hs-mens-chest", unit: "in", validationRange: { min: 30.0, max: 60.0, step: 0.25 } },
      { id: "m-sh-02", code: "M-SH-02", name: "Natural Waist", category: "girth", baseMeasurement: 34.0, defaultEase: 3.5, tolerance: 0.25, landmarkId: "hs-mens-waist", unit: "in", validationRange: { min: 26.0, max: 56.0, step: 0.25 } },
      { id: "m-sh-03", code: "M-SH-03", name: "Hip / Seat Circumference", category: "girth", baseMeasurement: 41.0, defaultEase: 4.5, tolerance: 0.25, landmarkId: "hs-mens-hip", unit: "in", validationRange: { min: 32.0, max: 60.0, step: 0.25 } },
      { id: "m-sh-04", code: "M-SH-04", name: "Shoulder Width (Acromion to Acromion)", category: "width", baseMeasurement: 18.0, defaultEase: 0.75, tolerance: 0.125, landmarkId: "hs-mens-shoulder", unit: "in", validationRange: { min: 14.0, max: 24.0, step: 0.25 } },
      { id: "m-sh-05", code: "M-SH-05", name: "Band Collar Height & Circumference", category: "girth", baseMeasurement: 15.5, defaultEase: 0.85, tolerance: 0.125, landmarkId: "hs-mens-neck", unit: "in", validationRange: { min: 12.0, max: 22.0, step: 0.25 } },
      { id: "m-sh-06", code: "M-SH-06", name: "Sherwani Full Length (C7 to Knee/Calf)", category: "length", baseMeasurement: 42.0, defaultEase: 0.0, tolerance: 0.5, landmarkId: "hs-mens-sherwani-len", unit: "in", validationRange: { min: 34.0, max: 52.0, step: 0.5 } },
      { id: "m-sh-07", code: "M-SH-07", name: "Sleeve Length (Crown to Wrist)", category: "sleeve", baseMeasurement: 25.5, defaultEase: 0.5, tolerance: 0.25, landmarkId: "hs-mens-sleeve", unit: "in", validationRange: { min: 20.0, max: 32.0, step: 0.25 } },
      { id: "m-sh-08", code: "M-SH-08", name: "Across Chest Width", category: "width", baseMeasurement: 16.5, defaultEase: 0.5, tolerance: 0.25, landmarkId: "hs-mens-across-chest", unit: "in", validationRange: { min: 13.0, max: 22.0, step: 0.25 } }
    ]
  },
  {
    garmentName: "Men's Custom Dress Shirt",
    gender: "Men",
    category: "Western",
    pomSchema: [
      { id: "m-st-01", code: "M-ST-01", name: "Collar / Neck Band", category: "girth", baseMeasurement: 15.5, defaultEase: 0.75, tolerance: 0.125, landmarkId: "hs-mens-neck", unit: "in", validationRange: { min: 12.0, max: 22.0, step: 0.25 } },
      { id: "m-st-02", code: "M-ST-02", name: "Chest Circumference", category: "girth", baseMeasurement: 40.0, defaultEase: 4.0, tolerance: 0.25, landmarkId: "hs-mens-chest", unit: "in", validationRange: { min: 30.0, max: 60.0, step: 0.25 } },
      { id: "m-st-03", code: "M-ST-03", name: "Waist Circumference", category: "girth", baseMeasurement: 34.0, defaultEase: 3.5, tolerance: 0.25, landmarkId: "hs-mens-waist", unit: "in", validationRange: { min: 26.0, max: 56.0, step: 0.25 } },
      { id: "m-st-04", code: "M-ST-04", name: "Shoulder Yoke Width", category: "width", baseMeasurement: 18.0, defaultEase: 0.5, tolerance: 0.125, landmarkId: "hs-mens-shoulder", unit: "in", validationRange: { min: 14.0, max: 24.0, step: 0.25 } },
      { id: "m-st-05", code: "M-ST-05", name: "Shirt Length (Back)", category: "length", baseMeasurement: 30.0, defaultEase: 0.0, tolerance: 0.25, landmarkId: "hs-mens-shirt-len", unit: "in", validationRange: { min: 24.0, max: 38.0, step: 0.25 } },
      { id: "m-st-06", code: "M-ST-06", name: "Sleeve Length", category: "sleeve", baseMeasurement: 25.0, defaultEase: 0.5, tolerance: 0.25, landmarkId: "hs-mens-sleeve", unit: "in", validationRange: { min: 20.0, max: 32.0, step: 0.25 } },
      { id: "m-st-07", code: "M-ST-07", name: "Cuff Circumference", category: "girth", baseMeasurement: 8.5, defaultEase: 1.5, tolerance: 0.25, landmarkId: "hs-mens-cuff", unit: "in", validationRange: { min: 6.0, max: 13.0, step: 0.25 } }
    ]
  },
  {
    garmentName: "Men's Tailored Trouser",
    gender: "Men",
    category: "Western",
    pomSchema: [
      { id: "m-tr-01", code: "M-TR-01", name: "Waistband Circumference", category: "trouser", baseMeasurement: 34.0, defaultEase: 1.0, tolerance: 0.25, landmarkId: "hs-mens-trouser-waist", unit: "in", validationRange: { min: 26.0, max: 56.0, step: 0.25 } },
      { id: "m-tr-02", code: "M-TR-02", name: "Seat / Hip Circumference", category: "trouser", baseMeasurement: 41.0, defaultEase: 3.0, tolerance: 0.25, landmarkId: "hs-mens-hip", unit: "in", validationRange: { min: 32.0, max: 60.0, step: 0.25 } },
      { id: "m-tr-03", code: "M-TR-03", name: "Outseam Length", category: "trouser", baseMeasurement: 41.0, defaultEase: 0.0, tolerance: 0.25, landmarkId: "hs-mens-outseam", unit: "in", validationRange: { min: 32.0, max: 52.0, step: 0.25 } },
      { id: "m-tr-04", code: "M-TR-04", name: "Inseam Length", category: "trouser", baseMeasurement: 31.0, defaultEase: 0.0, tolerance: 0.25, landmarkId: "hs-mens-inseam", unit: "in", validationRange: { min: 24.0, max: 40.0, step: 0.25 } },
      { id: "m-tr-05", code: "M-TR-05", name: "Thigh Circumference", category: "trouser", baseMeasurement: 24.0, defaultEase: 2.5, tolerance: 0.25, landmarkId: "hs-mens-thigh", unit: "in", validationRange: { min: 18.0, max: 34.0, step: 0.25 } },
      { id: "m-tr-06", code: "M-TR-06", name: "Knee Circumference", category: "trouser", baseMeasurement: 18.0, defaultEase: 2.0, tolerance: 0.25, landmarkId: "hs-mens-knee", unit: "in", validationRange: { min: 13.0, max: 26.0, step: 0.25 } },
      { id: "m-tr-07", code: "M-TR-07", name: "Leg Opening / Hem", category: "trouser", baseMeasurement: 15.0, defaultEase: 1.0, tolerance: 0.25, landmarkId: "hs-mens-ankle", unit: "in", validationRange: { min: 10.0, max: 22.0, step: 0.25 } },
      { id: "m-tr-08", code: "M-TR-08", name: "Crotch Rise Depth", category: "trouser", baseMeasurement: 10.5, defaultEase: 0.5, tolerance: 0.25, landmarkId: "hs-mens-crotch", unit: "in", validationRange: { min: 8.0, max: 16.0, step: 0.25 } }
    ]
  },
  {
    garmentName: "Women's Sari Blouse",
    gender: "Women",
    category: "Ethnic",
    pomSchema: [
      { id: "w-sb-01", code: "W-SB-01", name: "Upper Bust Circumference", category: "girth", baseMeasurement: 34.0, defaultEase: 0.75, tolerance: 0.125, landmarkId: "hs-womens-upperbust", unit: "in", validationRange: { min: 26.0, max: 52.0, step: 0.25 } },
      { id: "w-sb-02", code: "W-SB-02", name: "Full Bust Peak", category: "girth", baseMeasurement: 36.0, defaultEase: 1.25, tolerance: 0.125, landmarkId: "hs-womens-fullbust", unit: "in", validationRange: { min: 28.0, max: 56.0, step: 0.25 } },
      { id: "w-sb-03", code: "W-SB-03", name: "Underbust / Band", category: "girth", baseMeasurement: 30.0, defaultEase: 0.5, tolerance: 0.125, landmarkId: "hs-womens-underbust", unit: "in", validationRange: { min: 24.0, max: 48.0, step: 0.25 } },
      { id: "w-sb-04", code: "W-SB-04", name: "Apex Distance (Nipple to Nipple)", category: "width", baseMeasurement: 7.5, defaultEase: 0.0, tolerance: 0.125, landmarkId: "hs-womens-apex-dist", unit: "in", validationRange: { min: 5.5, max: 11.0, step: 0.25 } },
      { id: "w-sb-05", code: "W-SB-05", name: "Apex Height (Shoulder to Apex)", category: "length", baseMeasurement: 10.0, defaultEase: 0.0, tolerance: 0.125, landmarkId: "hs-womens-apex-height", unit: "in", validationRange: { min: 7.5, max: 14.0, step: 0.25 } },
      { id: "w-sb-06", code: "W-SB-06", name: "Front Neck Drop", category: "length", baseMeasurement: 7.0, defaultEase: 0.0, tolerance: 0.125, landmarkId: "hs-womens-front-neck", unit: "in", validationRange: { min: 4.0, max: 11.0, step: 0.25 } },
      { id: "w-sb-07", code: "W-SB-07", name: "Back Neck Drop", category: "length", baseMeasurement: 9.5, defaultEase: 0.0, tolerance: 0.125, landmarkId: "hs-womens-back-neck", unit: "in", validationRange: { min: 4.0, max: 15.0, step: 0.25 } },
      { id: "w-sb-08", code: "W-SB-08", name: "Armhole / Armscye Depth", category: "width", baseMeasurement: 15.0, defaultEase: 0.5, tolerance: 0.125, landmarkId: "hs-womens-armscye", unit: "in", validationRange: { min: 11.0, max: 22.0, step: 0.25 } },
      { id: "w-sb-09", code: "W-SB-09", name: "Blouse Total Length", category: "length", baseMeasurement: 14.5, defaultEase: 0.0, tolerance: 0.25, landmarkId: "hs-womens-blouse-len", unit: "in", validationRange: { min: 11.0, max: 19.0, step: 0.25 } }
    ]
  },
  {
    garmentName: "Women's Lehenga Choli",
    gender: "Women",
    category: "Ethnic",
    pomSchema: [
      { id: "w-lc-01", code: "W-LC-01", name: "Lehenga Waistline (Navel)", category: "girth", baseMeasurement: 28.0, defaultEase: 0.5, tolerance: 0.25, landmarkId: "hs-womens-waist", unit: "in", validationRange: { min: 22.0, max: 48.0, step: 0.25 } },
      { id: "w-lc-02", code: "W-LC-02", name: "High Hip / Seat Circumference", category: "girth", baseMeasurement: 38.0, defaultEase: 3.0, tolerance: 0.25, landmarkId: "hs-womens-hip", unit: "in", validationRange: { min: 30.0, max: 58.0, step: 0.25 } },
      { id: "w-lc-03", code: "W-LC-03", name: "Lehenga Length (Waist to Floor)", category: "length", baseMeasurement: 42.0, defaultEase: 0.5, tolerance: 0.375, landmarkId: "hs-womens-lehenga-len", unit: "in", validationRange: { min: 34.0, max: 50.0, step: 0.25 } },
      { id: "w-lc-04", code: "W-LC-04", name: "Choli Bust Circumference", category: "girth", baseMeasurement: 36.0, defaultEase: 1.5, tolerance: 0.125, landmarkId: "hs-womens-fullbust", unit: "in", validationRange: { min: 28.0, max: 56.0, step: 0.25 } },
      { id: "w-lc-05", code: "W-LC-05", name: "Choli Underbust Band", category: "girth", baseMeasurement: 30.0, defaultEase: 0.75, tolerance: 0.125, landmarkId: "hs-womens-underbust", unit: "in", validationRange: { min: 24.0, max: 48.0, step: 0.25 } },
      { id: "w-lc-06", code: "W-LC-06", name: "Choli Back Length", category: "length", baseMeasurement: 15.0, defaultEase: 0.0, tolerance: 0.25, landmarkId: "hs-womens-choli-len", unit: "in", validationRange: { min: 12.0, max: 20.0, step: 0.25 } }
    ]
  },
  {
    garmentName: "Women's Anarkali Suit",
    gender: "Women",
    category: "Ethnic",
    pomSchema: [
      { id: "w-an-01", code: "W-AN-01", name: "Full Bust Circumference", category: "girth", baseMeasurement: 36.0, defaultEase: 2.5, tolerance: 0.25, landmarkId: "hs-womens-fullbust", unit: "in", validationRange: { min: 28.0, max: 56.0, step: 0.25 } },
      { id: "w-an-02", code: "W-AN-02", name: "Empire Waist Band", category: "girth", baseMeasurement: 30.0, defaultEase: 2.0, tolerance: 0.25, landmarkId: "hs-womens-underbust", unit: "in", validationRange: { min: 24.0, max: 48.0, step: 0.25 } },
      { id: "w-an-03", code: "W-AN-03", name: "Yoke / Empire Height", category: "length", baseMeasurement: 14.5, defaultEase: 0.0, tolerance: 0.125, landmarkId: "hs-womens-yoke-len", unit: "in", validationRange: { min: 11.0, max: 19.0, step: 0.25 } },
      { id: "w-an-04", code: "W-AN-04", name: "Anarkali Total Length", category: "length", baseMeasurement: 54.0, defaultEase: 0.5, tolerance: 0.5, landmarkId: "hs-womens-gown-len", unit: "in", validationRange: { min: 42.0, max: 64.0, step: 0.5 } },
      { id: "w-an-05", code: "W-AN-05", name: "Flare Hem Circumference", category: "girth", baseMeasurement: 120.0, defaultEase: 12.0, tolerance: 1.0, landmarkId: "hs-womens-flare", unit: "in", validationRange: { min: 80.0, max: 240.0, step: 1.0 } },
      { id: "w-an-06", code: "W-AN-06", name: "Sleeve Length", category: "sleeve", baseMeasurement: 22.0, defaultEase: 0.5, tolerance: 0.25, landmarkId: "hs-womens-sleeve", unit: "in", validationRange: { min: 14.0, max: 26.0, step: 0.25 } }
    ]
  },
  {
    garmentName: "Women's Structured Corset",
    gender: "Women",
    category: "Couture",
    pomSchema: [
      { id: "w-co-01", code: "W-CO-01", name: "Overbust Circumference", category: "girth", baseMeasurement: 34.0, defaultEase: -1.0, tolerance: 0.125, landmarkId: "hs-womens-upperbust", unit: "in", validationRange: { min: 26.0, max: 52.0, step: 0.25 } },
      { id: "w-co-02", code: "W-CO-02", name: "Full Bust Peak", category: "girth", baseMeasurement: 36.0, defaultEase: -1.5, tolerance: 0.125, landmarkId: "hs-womens-fullbust", unit: "in", validationRange: { min: 28.0, max: 56.0, step: 0.25 } },
      { id: "w-co-03", code: "W-CO-03", name: "Underbust Line", category: "girth", baseMeasurement: 30.0, defaultEase: -1.5, tolerance: 0.125, landmarkId: "hs-womens-underbust", unit: "in", validationRange: { min: 24.0, max: 48.0, step: 0.25 } },
      { id: "w-co-04", code: "W-CO-04", name: "Waist Cinch Target", category: "girth", baseMeasurement: 28.0, defaultEase: -3.0, tolerance: 0.125, landmarkId: "hs-womens-waist", unit: "in", validationRange: { min: 20.0, max: 44.0, step: 0.25 } },
      { id: "w-co-05", code: "W-CO-05", name: "High Hip Curve", category: "girth", baseMeasurement: 35.0, defaultEase: -0.5, tolerance: 0.125, landmarkId: "hs-womens-highhip", unit: "in", validationRange: { min: 28.0, max: 52.0, step: 0.25 } },
      { id: "w-co-06", code: "W-CO-06", name: "Busk Front Length", category: "length", baseMeasurement: 13.0, defaultEase: 0.0, tolerance: 0.125, landmarkId: "hs-womens-busk-len", unit: "in", validationRange: { min: 10.0, max: 18.0, step: 0.25 } }
    ]
  },
  {
    garmentName: "Women's Evening Gown",
    gender: "Women",
    category: "Couture",
    pomSchema: [
      { id: "w-go-01", code: "W-GO-01", name: "Full Bust Circumference", category: "girth", baseMeasurement: 36.0, defaultEase: 2.0, tolerance: 0.25, landmarkId: "hs-womens-fullbust", unit: "in", validationRange: { min: 28.0, max: 56.0, step: 0.25 } },
      { id: "w-go-02", code: "W-GO-02", name: "Natural Waist Circumference", category: "girth", baseMeasurement: 28.0, defaultEase: 1.5, tolerance: 0.25, landmarkId: "hs-womens-waist", unit: "in", validationRange: { min: 22.0, max: 48.0, step: 0.25 } },
      { id: "w-go-03", code: "W-GO-03", name: "High Hip / Seat", category: "girth", baseMeasurement: 38.0, defaultEase: 2.5, tolerance: 0.25, landmarkId: "hs-womens-hip", unit: "in", validationRange: { min: 30.0, max: 58.0, step: 0.25 } },
      { id: "w-go-04", code: "W-GO-04", name: "Hollow to Hem Length", category: "length", baseMeasurement: 58.0, defaultEase: 0.5, tolerance: 0.5, landmarkId: "hs-womens-hollow-hem", unit: "in", validationRange: { min: 46.0, max: 66.0, step: 0.5 } },
      { id: "w-go-05", code: "W-GO-05", name: "Train Sweep Extra Length", category: "length", baseMeasurement: 18.0, defaultEase: 0.0, tolerance: 0.5, landmarkId: "hs-womens-train", unit: "in", validationRange: { min: 0.0, max: 60.0, step: 0.5 } },
      { id: "w-go-06", code: "W-GO-06", name: "Shoulder to Waist Length", category: "length", baseMeasurement: 16.0, defaultEase: 0.0, tolerance: 0.25, landmarkId: "hs-womens-sh-waist", unit: "in", validationRange: { min: 13.0, max: 20.0, step: 0.25 } }
    ]
  }
];

async function main() {
  console.log('🌱 Starting database seeding for YellowHouse Tailoring OS...');

  // Delete existing global templates to keep seed script idempotent
  await prisma.measurementTemplate.deleteMany({
    where: { tenantId: null },
  });

  // Seed default measurement templates
  for (const template of defaultTemplates) {
    const created = await prisma.measurementTemplate.create({
      data: {
        tenantId: null,
        garmentName: template.garmentName,
        gender: template.gender,
        category: template.category,
        pomSchema: template.pomSchema,
      },
    });
    console.log(`  ✓ Seeded Global Template: [${created.gender}] ${created.garmentName}`);
  }

  console.log(`✨ Database seeding completed successfully! (${defaultTemplates.length} templates created)`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed with error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## 4. Operational & Verification Recommendations

1. **Prisma Generation & Seeding Verification**:
   - Run `npx prisma generate` inside `apps/api/` to update client bindings.
   - Execute `npx ts-node prisma/seed.ts` or `npm run seed` to verify DB template population.

2. **Backend Server Startup**:
   - Run `npm run dev` or `nest start` in `apps/api/`.

3. **HTTP API Contract Testing**:
   - Test Slug Availability:
     - `GET http://localhost:3001/onboarding/check-slug/royal-tailors` -> `{ "available": true, "slug": "royal-tailors", "message": "Slug is available." }`
     - `GET http://localhost:3001/onboarding/check-slug/Invalid Slug!` -> `{ "available": false, "slug": "Invalid Slug!", "message": "Invalid slug format..." }`
   - Test Signup Transaction:
     - `POST http://localhost:3001/onboarding/signup` with payload:
       ```json
       {
         "boutiqueName": "Royal Tailors",
         "tenantSlug": "royal-tailors",
         "ownerName": "Arthur Pendelton",
         "ownerEmail": "arthur@royaltailors.com",
         "ownerPassword": "Password123!",
         "templateOptions": ["mens", "womens"]
       }
       ```
     - Verify status code 201 Created and response containing Tenant, Branch, and User IDs.
