import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';

const RESERVED_SLUGS = [
  'admin',
  'api',
  'auth',
  'login',
  'register',
  'onboarding',
  'app',
  'system',
  'root',
  'public',
  'static',
  'dashboard',
  'settings',
  'support',
  'billing',
];

@Injectable()
export class OnboardingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async checkSlug(slug: string) {
    const normalizedSlug = (slug || '').trim().toLowerCase();

    // Check slug format regex (3 to 50 lowercase alphanumeric + hyphens, no starting/ending hyphen)
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!normalizedSlug || normalizedSlug.length < 3 || normalizedSlug.length > 50 || !slugRegex.test(normalizedSlug)) {
      return {
        slug: normalizedSlug,
        available: false,
        reason: 'INVALID_FORMAT',
        message: 'Invalid slug format. Must be 3-50 lowercase alphanumeric characters and hyphens.',
      };
    }

    // Check reserved keywords
    if (RESERVED_SLUGS.includes(normalizedSlug)) {
      return {
        slug: normalizedSlug,
        available: false,
        reason: 'SLUG_RESERVED',
        message: `'${normalizedSlug}' is a reserved system keyword.`,
      };
    }

    // Query database for existing slug
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { slug: normalizedSlug },
    });

    if (existingTenant) {
      return {
        slug: normalizedSlug,
        available: false,
        reason: 'SLUG_TAKEN',
        message: 'Tenant slug is already taken by another boutique.',
      };
    }

    return {
      slug: normalizedSlug,
      available: true,
      reason: null,
      message: 'Workspace slug is available.',
    };
  }

  async signup(dto: SignupDto) {
    const effectiveSlug = (dto.tenantSlug || dto.slug || '').trim().toLowerCase();
    const effectiveOwnerName = (dto.ownerName || dto.fullName || '').trim();
    const effectiveEmail = (dto.ownerEmail || dto.email || '').trim().toLowerCase();
    const effectivePassword = dto.ownerPassword || dto.password || '';
    const effectiveTemplates = dto.templates || dto.templateOptions || [];

    if (!effectiveSlug || effectiveSlug.length < 3 || effectiveSlug.length > 50 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(effectiveSlug)) {
      throw new BadRequestException('Slug must consist of 3-50 lowercase alphanumeric characters and hyphens.');
    }

    if (RESERVED_SLUGS.includes(effectiveSlug)) {
      throw new ConflictException(`Slug '${effectiveSlug}' is reserved for system use.`);
    }

    if (!effectiveOwnerName) {
      throw new BadRequestException('Owner name is required.');
    }

    if (!effectiveEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(effectiveEmail)) {
      throw new BadRequestException('Valid owner email is required.');
    }

    if (!effectivePassword || effectivePassword.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters long.');
    }

    // Check slug uniqueness
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { slug: effectiveSlug },
    });
    if (existingTenant) {
      throw new ConflictException(`Tenant slug '${effectiveSlug}' is already registered.`);
    }

    // Check user email uniqueness
    const existingUser = await this.prisma.user.findUnique({
      where: { email: effectiveEmail },
    });
    if (existingUser) {
      throw new ConflictException(`Email address '${effectiveEmail}' is already registered.`);
    }

    // Hash password using bcryptjs
    const passwordHash = await bcrypt.hash(effectivePassword, 10);

    // Atomic transaction for creating Tenant, Branch, Owner User, and seeding Tenant Templates
    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Create Tenant
        const tenant = await tx.tenant.create({
          data: {
            name: dto.boutiqueName.trim(),
            slug: effectiveSlug,
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

        // 3. Create Owner User
        const user = await tx.user.create({
          data: {
            tenantId: tenant.id,
            branchId: branch.id,
            name: effectiveOwnerName,
            email: effectiveEmail,
            passwordHash,
            role: 'TENANT_OWNER',
          },
        });

        // 4. Copy Global Measurement Templates to Tenant Scope
        let seededTemplatesCount = 0;
        const globalTemplates = await tx.measurementTemplate.findMany({
          where: { tenantId: null },
        });

        if (globalTemplates.length > 0) {
          let templatesToCopy = globalTemplates;

          // If template options/selection filter provided by user
          if (effectiveTemplates.length > 0) {
            const selectedOpts = effectiveTemplates.map((t) => t.toLowerCase());

            // Filter by category or garment match
            templatesToCopy = globalTemplates.filter((gt) => {
              const garmentLower = gt.garmentName.toLowerCase();
              const categoryLower = gt.category.toLowerCase();
              const genderLower = gt.gender.toLowerCase();

              return selectedOpts.some(
                (opt) =>
                  garmentLower.includes(opt) ||
                  categoryLower.includes(opt) ||
                  genderLower.includes(opt) ||
                  (opt === 'mens_bespoke' && (genderLower.includes('men') || categoryLower.includes('western') || categoryLower.includes('ethnic'))) ||
                  (opt === 'womens_couture' && (genderLower.includes('women') || categoryLower.includes('ethnic') || categoryLower.includes('couture'))) ||
                  opt === 'all' ||
                  opt === 'custom',
              );
            });

            // Fallback if filter leaves empty: copy all global templates
            if (templatesToCopy.length === 0) {
              templatesToCopy = globalTemplates;
            }
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

        // Generate JWT session token
        const token = this.jwtService.sign({
          sub: user.id,
          email: user.email,
          role: user.role,
          tenantId: tenant.id,
          branchId: branch.id,
        });

        return {
          success: true,
          tenant: {
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            plan: tenant.plan,
            status: tenant.status,
            createdAt: tenant.createdAt,
          },
          branch: {
            id: branch.id,
            name: branch.name,
            city: branch.city,
            isPrimary: branch.isPrimary,
          },
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
            branchId: user.branchId,
          },
          token,
          seededTemplatesCount,
          message: 'Boutique onboarded successfully.',
        };
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException('Tenant slug or owner email is already registered');
      }
      throw error;
    }
  }
}
