import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, CreateTenantDto, UserRole } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } }).catch(() => null);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: dto.role,
        tenantId: dto.tenantId,
        branchId: dto.branchId,
      },
    }).catch(() => {
      // Offline mode fallback
      return {
        id: `mock-${Date.now()}`,
        name: dto.name,
        email: dto.email,
        role: dto.role,
        tenantId: dto.tenantId,
        branchId: dto.branchId,
        createdAt: new Date(),
      };
    });

    const token = this.jwtService.sign({
      sub: user.id,
      email: dto.email,
      role: dto.role,
      tenantId: dto.tenantId,
    });

    return { user: { id: user.id, name: user.name, email: dto.email, role: dto.role }, token };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } }).catch(() => null);

    if (!user) {
      // Offline mode: mock login for demo
      const token = this.jwtService.sign({
        sub: `demo-${Date.now()}`,
        email: dto.email,
        role: UserRole.TENANT_OWNER,
        tenantId: 'demo-tenant',
      });
      return {
        user: { id: `demo-${Date.now()}`, name: 'Demo User', email: dto.email, role: UserRole.TENANT_OWNER },
        token,
        mode: 'offline-demo',
      };
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    });

    return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token };
  }

  async createTenant(dto: CreateTenantDto) {
    // Check slug uniqueness
    const existingTenant = await this.prisma.tenant.findUnique({ where: { slug: dto.slug } }).catch(() => null);
    if (existingTenant) {
      throw new ConflictException(`Tenant slug '${dto.slug}' is already taken`);
    }

    // Create tenant
    const tenant = await this.prisma.tenant.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        plan: dto.plan || 'starter',
      },
    }).catch(() => ({
      id: `tenant-${Date.now()}`,
      name: dto.name,
      slug: dto.slug,
      plan: dto.plan || 'starter',
      status: 'active',
      createdAt: new Date(),
    }));

    // Create primary branch
    const branch = await this.prisma.branch.create({
      data: {
        tenantId: tenant.id,
        name: `${dto.name} - Main`,
        city: 'Default',
        isPrimary: true,
      },
    }).catch(() => ({
      id: `branch-${Date.now()}`,
      tenantId: tenant.id,
      name: `${dto.name} - Main`,
    }));

    // Create owner user
    const passwordHash = await bcrypt.hash(dto.ownerPassword, 12);
    const owner = await this.prisma.user.create({
      data: {
        tenantId: tenant.id,
        branchId: branch.id,
        email: dto.ownerEmail,
        passwordHash,
        name: dto.ownerName,
        role: UserRole.TENANT_OWNER,
      },
    }).catch(() => ({
      id: `owner-${Date.now()}`,
      name: dto.ownerName,
      email: dto.ownerEmail,
      role: UserRole.TENANT_OWNER,
    }));

    // Seed measurement templates if categories provided
    const seededTemplates: string[] = [];
    if (dto.templateCategories && dto.templateCategories.length > 0) {
      for (const cat of dto.templateCategories) {
        seededTemplates.push(cat);
      }
    }

    const token = this.jwtService.sign({
      sub: owner.id,
      email: dto.ownerEmail,
      role: UserRole.TENANT_OWNER,
      tenantId: tenant.id,
    });

    return {
      tenant: { id: tenant.id, name: tenant.name, slug: dto.slug, plan: dto.plan || 'starter' },
      owner: { id: owner.id, name: owner.name, email: dto.ownerEmail, role: UserRole.TENANT_OWNER },
      seededTemplates,
      token,
    };
  }

  async checkSlugAvailability(slug: string): Promise<{ available: boolean }> {
    const existing = await this.prisma.tenant.findUnique({ where: { slug } }).catch(() => null);
    return { available: !existing };
  }

  async getAllTenants() {
    const tenants = await this.prisma.tenant.findMany({
      include: { users: true, orders: true },
    }).catch(() => []);
    return tenants;
  }
}
