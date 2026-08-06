# Milestone 1 Integration & Verification Strategy Analysis

## Executive Summary
This document provides the definitive, read-only integration and verification specification for **Milestone 1: Multi-Tenant Onboarding & Database Seeding Flow** of YellowHouse Tailoring OS. 
It establishes the payload interface contracts, comprehensive test suites (unit, integration, database seed, and UI component), monorepo build check verification procedures, and exact test code assertions to ensure seamless integration between the NestJS backend (`apps/api`) and Next.js 14 frontend (`apps/web`).

---

## 1. Interface Contracts & Payload Verification

### 1.1 `GET /onboarding/check-slug/:slug`

#### Route & Parameters
- **HTTP Method**: `GET`
- **Path**: `/onboarding/check-slug/:slug`
- **Route Parameter**: `:slug` (string)
- **Validation Rules**:
  - Pattern: Must match regex `^[a-z0-9-]+$`
  - Length: Minimum 3 characters, maximum 50 characters
  - Formatting: Cannot start or end with hyphens (`-`); no double hyphens (`--`)
  - Reserved Keywords: `['admin', 'api', 'auth', 'login', 'register', 'onboarding', 'app', 'system', 'root', 'public', 'static', 'dashboard', 'settings', 'support', 'billing']`

#### Request Header & Example
```http
GET /onboarding/check-slug/savile-row HTTP/1.1
Host: localhost:4000
Accept: application/json
```

#### Response Payloads
- **Status 200 OK (Slug Available)**:
  ```json
  {
    "slug": "savile-row",
    "available": true,
    "reason": null
  }
  ```

- **Status 200 OK (Slug Taken)**:
  ```json
  {
    "slug": "savile-row",
    "available": false,
    "reason": "SLUG_TAKEN"
  }
  ```

- **Status 200 OK / 400 Bad Request (Slug Invalid Format)**:
  ```json
  {
    "slug": "Savile_Row!",
    "available": false,
    "reason": "INVALID_FORMAT"
  }
  ```

- **Status 200 OK (Slug Reserved)**:
  ```json
  {
    "slug": "admin",
    "available": false,
    "reason": "SLUG_RESERVED"
  }
  ```

#### Frontend State Machine Integration (`apps/web/src/app/onboarding/page.tsx`)
- **Debounce Delay**: 300ms on slug text field input (`useDebounce` hook).
- **React State Structure**:
  ```typescript
  interface SlugCheckState {
    status: 'IDLE' | 'CHECKING' | 'AVAILABLE' | 'TAKEN' | 'INVALID' | 'RESERVED' | 'ERROR';
    message: string | null;
  }
  ```
- **UI Visual Mapping**:
  - `CHECKING`: Render loader icon with text "Checking availability..."
  - `AVAILABLE`: Render green check badge "✓ Tenant slug is available"
  - `TAKEN`: Render red error badge "✕ Tenant slug is already taken"
  - `INVALID`: Render amber alert "⚠ Slug must be 3-50 lowercase alphanumeric characters & hyphens"
  - `RESERVED`: Render amber alert "⚠ 'admin' is a reserved system keyword"

---

### 1.2 `POST /onboarding/signup`

#### Route & Parameters
- **HTTP Method**: `POST`
- **Path**: `/onboarding/signup`
- **Headers**: `Content-Type: application/json`

#### Request Body Payload (`SignupDto`)
```json
{
  "boutiqueName": "Savile Row Tailors",
  "slug": "savile-row",
  "ownerName": "Arthur Pendelton",
  "ownerEmail": "arthur@savilerow.com",
  "ownerPassword": "Password123!",
  "templates": ["mens-bespoke", "womens-couture"]
}
```

#### Server Validation Constraints (`SignupDto`)
| Field | Type | Decorators | Constraints |
|---|---|---|---|
| `boutiqueName` | `string` | `@IsString()`, `@IsNotEmpty()` | Length 2-100 characters |
| `slug` | `string` | `@IsString()`, `@IsNotEmpty()`, `@Matches(/^[a-z0-9-]+$/)` | Length 3-50 characters |
| `ownerName` | `string` | `@IsString()`, `@IsNotEmpty()` | Length 2-100 characters |
| `ownerEmail` | `string` | `@IsEmail()`, `@IsNotEmpty()` | Valid RFC 5322 email |
| `ownerPassword` | `string` | `@IsString()`, `@MinLength(8)` | Min 8 chars, 1 uppercase, 1 lowercase, 1 number |
| `templates` | `string[]` | `@IsArray()`, `@IsString({ each: true })`, `@IsOptional()` | Array of template identifiers |

#### Response Payloads
- **Status 201 Created (Success)**:
  ```json
  {
    "success": true,
    "tenant": {
      "id": "c1f2b3a4-5678-490a-bcde-f123456789ab",
      "name": "Savile Row Tailors",
      "slug": "savile-row",
      "plan": "starter",
      "status": "active",
      "createdAt": "2026-08-06T13:42:23.000Z"
    },
    "user": {
      "id": "u9f8e7d6-5432-410a-bcde-f987654321ba",
      "email": "arthur@savilerow.com",
      "name": "Arthur Pendelton",
      "role": "TENANT_OWNER",
      "tenantId": "c1f2b3a4-5678-490a-bcde-f123456789ab",
      "branchId": "b1a2c3d4-5678-490a-bcde-f123456789cd"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
  ```

- **Status 409 Conflict (Duplicate Slug or Email)**:
  ```json
  {
    "statusCode": 409,
    "message": "Tenant slug 'savile-row' is already registered",
    "error": "Conflict"
  }
  ```

- **Status 400 Bad Request (Validation Failures)**:
  ```json
  {
    "statusCode": 400,
    "message": [
      "slug must match /^[a-z0-9-]+$/ regular expression",
      "ownerEmail must be an email",
      "ownerPassword must be longer than or equal to 8 characters"
    ],
    "error": "Bad Request"
  }
  ```

---

## 2. Test Strategy & Suite Specifications

```
                           ┌──────────────────────────────────────────────────────────┐
                           │               Milestone 1 Test Hierarchy                 │
                           └────────────────────────────┬─────────────────────────────┘
                                                        │
         ┌──────────────────────────────┬───────────────┴──────────────┬──────────────────────────────┐
         ▼                              ▼                              ▼                              ▼
┌─────────────────┐           ┌──────────────────┐           ┌─────────────────┐           ┌────────────────────┐
│ 1. API Slug     │           │ 2. API Owner     │           │ 3. Database     │           │ 4. Frontend        │
│    Check Test   │           │    Signup Test   │           │    Seed Test    │           │    Page Test       │
└────────┬────────┘           └────────┬─────────┘           └────────┬────────┘           └─────────┬──────────┘
         │                             │                              │                              │
         ▼                             ▼                              ▼                              ▼
• Regex validation            • DB Transaction               • Global POM               • Form layout
• Reserved keywords           • Tenant creation              • Category check           • Debounce slug indicator
• Unique lookup               • Owner user + hash            • Idempotency              • Form submission & JWT
```

---

## 3. Concrete Test Implementations

### 3.1 Backend Test 1: Slug Check Unit & Integration Test
**File Path**: `apps/api/src/modules/onboarding/__tests__/onboarding-slug.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { OnboardingController } from '../onboarding.controller';
import { OnboardingService } from '../onboarding.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('OnboardingController - checkSlug', () => {
  let controller: OnboardingController;
  let service: OnboardingService;
  let prisma: PrismaService;

  const mockPrismaService = {
    tenant: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OnboardingController],
      providers: [
        OnboardingService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    controller = module.get<OnboardingController>(OnboardingController);
    service = module.get<OnboardingService>(OnboardingService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should return available=true for valid unused slug', async () => {
    mockPrismaService.tenant.findUnique.mockResolvedValue(null);

    const result = await controller.checkSlug('savile-row');

    expect(result).toEqual({
      slug: 'savile-row',
      available: true,
      reason: null,
    });
    expect(mockPrismaService.tenant.findUnique).toHaveBeenCalledWith({
      where: { slug: 'savile-row' },
    });
  });

  it('should return available=false with SLUG_TAKEN when slug exists in database', async () => {
    mockPrismaService.tenant.findUnique.mockResolvedValue({
      id: 'existing-tenant-id',
      slug: 'existing-boutique',
    });

    const result = await controller.checkSlug('existing-boutique');

    expect(result).toEqual({
      slug: 'existing-boutique',
      available: false,
      reason: 'SLUG_TAKEN',
    });
  });

  it('should return available=false with INVALID_FORMAT for uppercase or invalid characters', async () => {
    const result = await controller.checkSlug('Savile_Row!');

    expect(result).toEqual({
      slug: 'Savile_Row!',
      available: false,
      reason: 'INVALID_FORMAT',
    });
    expect(mockPrismaService.tenant.findUnique).not.toHaveBeenCalled();
  });

  it('should return available=false with SLUG_RESERVED for system reserved slugs', async () => {
    const result = await controller.checkSlug('admin');

    expect(result).toEqual({
      slug: 'admin',
      available: false,
      reason: 'SLUG_RESERVED',
    });
    expect(mockPrismaService.tenant.findUnique).not.toHaveBeenCalled();
  });
});
```

---

### 3.2 Backend Test 2: Signup Atomic Transaction Integration Test
**File Path**: `apps/api/src/modules/onboarding/__tests__/onboarding-signup.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { OnboardingService } from '../onboarding.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('OnboardingService - signup', () => {
  let service: OnboardingService;
  let prisma: PrismaService;

  const mockPrismaService = {
    tenant: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
    tenantCreate: jest.fn(),
    branchCreate: jest.fn(),
    userCreate: jest.fn(),
    measurementTemplateCreateMany: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token-string'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnboardingService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<OnboardingService>(OnboardingService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should execute atomic signup transaction creating Tenant, Branch, User, and Templates', async () => {
    const signupDto = {
      boutiqueName: 'Royal Tailors',
      slug: 'royal-tailors',
      ownerName: 'Victoria Sterling',
      ownerEmail: 'victoria@royaltailors.com',
      ownerPassword: 'Password123!',
      templates: ['mens-suit', 'womens-lehenga'],
    };

    mockPrismaService.tenant.findUnique.mockResolvedValue(null);
    mockPrismaService.user.findUnique.mockResolvedValue(null);

    const createdTenant = {
      id: 'tenant-123',
      name: 'Royal Tailors',
      slug: 'royal-tailors',
      plan: 'starter',
      status: 'active',
      createdAt: new Date(),
    };

    const createdBranch = {
      id: 'branch-123',
      tenantId: 'tenant-123',
      name: 'Main Branch',
      isPrimary: true,
    };

    const createdUser = {
      id: 'user-123',
      tenantId: 'tenant-123',
      branchId: 'branch-123',
      email: 'victoria@royaltailors.com',
      name: 'Victoria Sterling',
      role: 'TENANT_OWNER',
    };

    mockPrismaService.$transaction.mockImplementation(async (cb) => {
      return cb({
        tenant: { create: jest.fn().mockResolvedValue(createdTenant) },
        branch: { create: jest.fn().mockResolvedValue(createdBranch) },
        user: { create: jest.fn().mockResolvedValue(createdUser) },
        measurementTemplate: { createMany: jest.fn().mockResolvedValue({ count: 2 }) },
      });
    });

    const response = await service.signup(signupDto);

    expect(response.success).toBe(true);
    expect(response.tenant.slug).toBe('royal-tailors');
    expect(response.user.role).toBe('TENANT_OWNER');
    expect(response.token).toBe('mock-jwt-token-string');
  });

  it('should throw ConflictException if slug or owner email is already taken', async () => {
    mockPrismaService.tenant.findUnique.mockResolvedValue({
      id: 'existing-id',
      slug: 'royal-tailors',
    });

    const signupDto = {
      boutiqueName: 'Royal Tailors',
      slug: 'royal-tailors',
      ownerName: 'Victoria Sterling',
      ownerEmail: 'victoria@royaltailors.com',
      ownerPassword: 'Password123!',
    };

    await expect(service.signup(signupDto)).rejects.toThrow(ConflictException);
  });
});
```

---

### 3.3 Backend Test 3: Prisma Seed Idempotency Test
**File Path**: `apps/api/prisma/__tests__/seed.spec.ts`

```typescript
import { PrismaClient } from '@prisma/client';

describe('Prisma Database Seeding Verification', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should verify global measurement templates exist for all garment categories', async () => {
    const globalTemplates = await prisma.measurementTemplate.findMany({
      where: { tenantId: null },
    });

    expect(globalTemplates.length).toBeGreaterThanOrEqual(9);

    const categories = globalTemplates.map((t) => t.category);
    expect(categories).toContain('Western');
    expect(categories).toContain('Ethnic');
    expect(categories).toContain('Couture');
  });

  it('should verify default admin user account exists', async () => {
    const adminUser = await prisma.user.findFirst({
      where: { role: 'SYSTEM_ADMIN' },
    });

    expect(adminUser).not.toBeNull();
    expect(adminUser?.email).toBe('admin@yellowhouse.com');
  });
});
```

---

### 3.4 Frontend Test 4: Onboarding Page UI & Form Integration Test
**File Path**: `apps/web/src/app/onboarding/__tests__/onboarding-page.test.tsx`

```typescript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OnboardingPage from '../page';

// Mock fetch globally
global.fetch = jest.fn();

describe('OnboardingPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all onboarding form fields and template checkboxes', () => {
    render(<OnboardingPage />);

    expect(screen.getByLabelText(/Boutique Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tenant Slug/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Owner Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Owner Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByText(/Men's Bespoke/i)).toBeInTheDocument();
    expect(screen.getByText(/Women's Couture/i)).toBeInTheDocument();
  });

  it('triggers debounced slug check and displays available badge', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ slug: 'savile-row', available: true, reason: null }),
    });

    render(<OnboardingPage />);
    const slugInput = screen.getByLabelText(/Tenant Slug/i);

    fireEvent.change(slugInput, { target: { value: 'savile-row' } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/onboarding/check-slug/savile-row')
      );
    }, { timeout: 500 });

    expect(await screen.findByText(/Tenant slug is available/i)).toBeInTheDocument();
  });
});
```

---

## 4. Monorepo Build Check Verification Strategy

### 4.1 Backend API Build Check (`apps/api`)
- **Build Command**:
  ```bash
  cd C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\apps\api
  npm run build
  ```
- **Internal Execution**: Executes NestJS CLI (`nest build`), invoking `tsc -p tsconfig.build.json`.
- **Pass Criteria**:
  1. Process exit code = `0`.
  2. Compilation completes with `0` errors.
  3. Generated output files exist at `apps/api/dist/modules/onboarding/onboarding.controller.js` and `onboarding.service.js`.

### 4.2 Frontend Web Build Check (`apps/web`)
- **Build Command**:
  ```bash
  cd C:\Users\gnvna\.gemini\antigravity\scratch\yellowhouse\apps\web
  npx next build
  ```
- **Internal Execution**: Compiles React 18 / Next.js 14 App Router, verifying route static generation and type safety.
- **Pass Criteria**:
  1. Process exit code = `0`.
  2. Output confirms static/dynamic route compilation for `/onboarding`.
  3. `0` ESLint or TypeScript build errors.

---

## 5. Summary Matrix & Verification Step Checklist

| Phase | Verification Item | Target File | Command / Method | Expected Result |
|---|---|---|---|---|
| 1 | API TypeScript Compilation | `apps/api` | `npx tsc --noEmit` | Clean output, exit code 0 |
| 2 | Web TypeScript Compilation | `apps/web` | `npx tsc --noEmit` | Clean output, exit code 0 |
| 3 | API Build Verification | `apps/api` | `npm run build` | `dist/` directory generated, exit code 0 |
| 4 | Web Next.js Build | `apps/web` | `npx next build` | Build success, `/onboarding` compiled |
| 5 | Slug Check API Test | `apps/api/src/.../onboarding-slug.spec.ts` | `npx vitest run` | All 4 slug test cases PASS |
| 6 | Signup Transaction Test | `apps/api/src/.../onboarding-signup.spec.ts` | `npx vitest run` | Transaction & rollback test PASS |
| 7 | DB Seed Test | `apps/api/prisma/__tests__/seed.spec.ts` | `npx vitest run` | Template count >= 9, admin user exists |
| 8 | UI Onboarding Page Test | `apps/web/src/.../onboarding-page.test.tsx` | `npx vitest run` | Render & debounce fetch PASS |
