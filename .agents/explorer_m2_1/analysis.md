# Technical Implementation Analysis & Design: Milestone 2 Backend (RBAC & JWT Setup)

## 1. Overview & Objectives

Milestone 2 Backend establishes the core Authentication & Role-Based Access Control (RBAC) infrastructure for YellowHouse Tailoring OS.
This document presents the exact technical design, directory layout, DTO specifications, service & controller logic, security guards, custom decorators, and middleware dynamic tenant context resolution.

---

## 2. Directory Structure & File Map

All auth-related backend code resides within `apps/api/src/modules/auth` and `apps/api/src/common/middleware`.

```
apps/api/src/
├── common/
│   └── middleware/
│       └── tenant.middleware.ts              # Dynamic TenantId extraction (Header, Cookie, JWT)
├── modules/
│   ├── auth/
│   │   ├── decorators/
│   │   │   └── roles.decorator.ts            # @Roles(...) custom metadata decorator
│   │   ├── dto/
│   │   │   ├── login.dto.ts                  # Login payload validation (email, password)
│   │   │   └── register.dto.ts               # Register payload validation (email, password, name, role, tenantId)
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts             # JWT authentication guard extending AuthGuard('jwt')
│   │   │   └── roles.guard.ts                # Role-based authorization guard checking staff roles
│   │   ├── auth.controller.ts                # Auth REST controller (/auth/login, /auth/register, /auth/logout, /auth/me)
│   │   ├── auth.module.ts                    # NestJS auth module registering Passport, JwtModule, providers, & controller
│   │   ├── auth.service.ts                   # Auth business logic (bcrypt compare/hash, JWT signing, user query)
│   │   └── jwt.strategy.ts                   # Passport JWT strategy with multi-source token extraction
│   └── app.module.ts                         # Root application module registering AuthModule & TenantMiddleware
```

---

## 3. Detailed Component Specifications

### 3.1 DTO Specifications

#### `apps/api/src/modules/auth/dto/login.dto.ts`
```typescript
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
  @IsEmail({}, { message: 'Must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;
}
```

#### `apps/api/src/modules/auth/dto/register.dto.ts`
```typescript
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsEmail({}, { message: 'Must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  name: string;

  @IsString()
  @IsOptional()
  role?: string; // TENANT_OWNER, RECEPTIONIST, MASTER_TAILOR, KARIGAR, BRANCH_MANAGER, ACCOUNTANT

  @IsString()
  @IsOptional()
  tenantId?: string;
}
```

---

### 3.2 Passport Strategy & Token Extraction

#### `apps/api/src/modules/auth/jwt.strategy.ts`
The `JwtStrategy` extracts JWT tokens from HTTP-only cookies (`jwt_token`), Authorization Bearer headers, or custom `x-jwt-token` headers.

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-strategy';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  tenantId: string;
  branchId?: string | null;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async authenticate(req: Request): Promise<void> {
    try {
      const token = this.extractToken(req);
      if (!token) {
        return this.fail('No authentication token provided', 401);
      }

      const secret = process.env.JWT_SECRET || 'yellowhouse-secret-key-2026';
      const payload: JwtPayload = await this.jwtService.verifyAsync(token, { secret });

      const user = await this.validate(payload);
      if (!user) {
        return this.fail('Invalid token payload or user no longer exists', 401);
      }

      (req as any).user = user;
      this.success(user);
    } catch (err: any) {
      this.fail(err?.message || 'Unauthorized', 401);
    }
  }

  private extractToken(req: Request): string | null {
    // 1. Check req.cookies
    if ((req as any).cookies?.jwt_token) {
      return (req as any).cookies.jwt_token;
    }

    // 2. Extract from raw Cookie header
    const cookieHeader = req.headers.cookie;
    if (cookieHeader) {
      const match = cookieHeader.match(/(?:^|;\s*)jwt_token=([^;]+)/);
      if (match) {
        return decodeURIComponent(match[1]);
      }
    }

    // 3. Check Authorization header (Bearer <token>)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7).trim();
    }

    // 4. Check x-jwt-token header
    const customHeader = req.headers['x-jwt-token'];
    if (typeof customHeader === 'string' && customHeader) {
      return customHeader.trim();
    }

    return null;
  }

  async validate(payload: JwtPayload) {
    if (!payload.sub || !payload.tenantId) {
      throw new UnauthorizedException('Malformed token payload');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        branchId: true,
        createdAt: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      sub: user.id,
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
      branchId: user.branchId,
    };
  }
}
```

---

### 3.3 Guards & Decorators

#### `apps/api/src/modules/auth/decorators/roles.decorator.ts`
```typescript
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

#### `apps/api/src/modules/auth/guards/jwt-auth.guard.ts`
```typescript
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException(info?.message || 'Authentication token is invalid or missing');
    }
    return user;
  }
}
```

#### `apps/api/src/modules/auth/guards/roles.guard.ts`
Supports roles `TENANT_OWNER`, `RECEPTIONIST`, `MASTER_TAILOR`, `KARIGAR`, `BRANCH_MANAGER`, `ACCOUNTANT`. Case-insensitive match against allowed roles.

```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required to access this resource');
    }

    const userRoleNormalized = (user.role || '').toUpperCase();
    const hasRole = requiredRoles.some((role) => role.toUpperCase() === userRoleNormalized);

    if (!hasRole) {
      throw new ForbiddenException(
        `Role '${user.role}' is not authorized to access this resource. Required role(s): ${requiredRoles.join(', ')}`
      );
    }

    return true;
  }
}
```

---

### 3.4 AuthService Implementation

#### `apps/api/src/modules/auth/auth.service.ts`
Handles credential verification via `bcrypt.compare`, JWT issuance, HTTP-only cookie configuration, staff registration, and authenticated user profile retrieval.

```typescript
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto, res?: Response) {
    const emailLower = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: user.tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Associated tenant boutique not found');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      branchId: user.branchId || null,
    };

    const token = this.jwtService.sign(payload);

    if (res) {
      res.cookie('jwt_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        path: '/',
      });
    }

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        branchId: user.branchId,
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        plan: tenant.plan,
        status: tenant.status,
      },
    };
  }

  async register(dto: RegisterDto, currentTenantId?: string) {
    const emailLower = dto.email.trim().toLowerCase();
    const targetTenantId = dto.tenantId || currentTenantId;

    if (!targetTenantId) {
      throw new BadRequestException('Tenant context is required to register staff');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (existingUser) {
      throw new ConflictException(`User with email '${emailLower}' already exists`);
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: targetTenantId },
      include: { branches: true },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant '${targetTenantId}' not found`);
    }

    const primaryBranch = tenant.branches.find((b) => b.isPrimary) || tenant.branches[0];

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const assignedRole = dto.role || 'RECEPTIONIST';

    const newUser = await this.prisma.user.create({
      data: {
        tenantId: tenant.id,
        branchId: primaryBranch ? primaryBranch.id : null,
        name: dto.name.trim(),
        email: emailLower,
        passwordHash,
        role: assignedRole,
      },
    });

    return {
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        tenantId: newUser.tenantId,
        branchId: newUser.branchId,
        createdAt: newUser.createdAt,
      },
      message: 'Staff user registered successfully',
    };
  }

  async logout(res: Response) {
    res.clearCookie('jwt_token', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenant: true,
        branch: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User profile not found');
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        branchId: user.branchId,
        createdAt: user.createdAt,
      },
      tenant: user.tenant
        ? {
            id: user.tenant.id,
            name: user.tenant.name,
            slug: user.tenant.slug,
            plan: user.tenant.plan,
            status: user.tenant.status,
          }
        : null,
      branch: user.branch
        ? {
            id: user.branch.id,
            name: user.branch.name,
            city: user.branch.city,
            isPrimary: user.branch.isPrimary,
          }
        : null,
    };
  }
}
```

---

### 3.5 AuthController Implementation

#### `apps/api/src/modules/auth/auth.controller.ts`
Exposes the required 4 endpoints: `POST /auth/login`, `POST /auth/register`, `POST /auth/logout`, `GET /auth/me`.

```typescript
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TenantRequest } from '../../common/middleware/tenant.middleware';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(dto, res);
  }

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Req() req: TenantRequest,
  ) {
    return this.authService.register(dto, req.tenantId);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: Request & { user: { id?: string; sub?: string } }) {
    const userId = req.user.sub || req.user.id;
    return this.authService.getMe(userId!);
  }
}
```

---

### 3.6 AuthModule Specification

#### `apps/api/src/modules/auth/auth.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'yellowhouse-secret-key-2026',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    PrismaService,
  ],
  exports: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    JwtModule,
  ],
})
export class AuthModule {}
```

---

### 3.7 Dynamic TenantMiddleware Update

#### `apps/api/src/common/middleware/tenant.middleware.ts`
Extracts `tenantId` dynamically in order of precedence:
1. `x-tenant-id` HTTP header
2. HTTP-only `jwt_token` cookie
3. Authorization Bearer header
4. Custom `x-jwt-token` header
5. Fallback: `'default-tenant-id'`

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export interface TenantRequest extends Request {
  tenantId?: string;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: TenantRequest, res: Response, next: NextFunction) {
    // 1. Direct header override takes highest precedence
    const headerTenantId = req.headers['x-tenant-id'] as string;
    if (headerTenantId && headerTenantId.trim()) {
      req.tenantId = headerTenantId.trim();
      return next();
    }

    // 2. Extract JWT token from cookie or authorization header
    let token: string | null = null;

    if (req.cookies?.jwt_token) {
      token = req.cookies.jwt_token;
    } else if (req.headers.cookie) {
      const match = req.headers.cookie.match(/(?:^|;\s*)jwt_token=([^;]+)/);
      if (match) {
        token = decodeURIComponent(match[1]);
      }
    }

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7).trim();
    }

    if (!token && typeof req.headers['x-jwt-token'] === 'string') {
      token = req.headers['x-jwt-token'].trim();
    }

    // 3. Decode token payload if present
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
          if (payload?.tenantId) {
            req.tenantId = payload.tenantId;
            return next();
          }
        }
      } catch {
        // Fall through to fallback
      }
    }

    // 4. Default fallback tenant context
    req.tenantId = 'default-tenant-id';
    next();
  }
}
```

---

### 3.8 AppModule Registration

#### `apps/api/src/app.module.ts`
```typescript
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
    AuthModule,
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

## 4. Architectural Analysis & Edge Case Mitigations

1. **Cookie Parsing Resilience**:
   - `JwtStrategy` and `TenantMiddleware` safely parse cookies directly from `req.headers.cookie` using regex even when Express `cookie-parser` middleware is not explicitly registered.
2. **Role Case-Insensitivity**:
   - `RolesGuard` compares normalized uppercase strings (e.g., `'TENANT_OWNER'` vs `'tenant_owner'`), preventing role mismatch bugs.
3. **Password Security**:
   - Standard bcrypt salt rounds (10) via `bcryptjs`.
   - Clear error messages that do not leak user existence on `/auth/login` (`Invalid email or password`).
4. **Token Security**:
   - HTTP-Only cookie `jwt_token` prevents XSS token theft.
   - `sameSite: 'lax'` prevents CSRF vulnerability while enabling seamless app navigation.
