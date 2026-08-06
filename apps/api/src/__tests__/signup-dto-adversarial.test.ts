import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { SignupDto } from '../modules/onboarding/dto/signup.dto';
import { OnboardingService } from '../modules/onboarding/onboarding.service';

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string, detail?: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${msg} ${detail ? `(${detail})` : ''}`);
    failed++;
  } else {
    console.log(`✅ PASS: ${msg}`);
    passed++;
  }
}

async function runTests() {
  console.log('\n==================================================');
  console.log('--- SIGNUP DTO & ONBOARDING SERVICE ADVERSARIAL TESTS ---');
  console.log('==================================================\n');

  // ----------------------------------------------------
  // TEST SUITE 1: SignupDto Validation & Class-Transformer
  // ----------------------------------------------------
  console.log('[Suite 1: SignupDto Transformation & Validation]');

  // 1.1 Uppercase slugs & emails should be transformed to lowercase
  const uppercaseInput = {
    boutiqueName: 'Royal Boutique',
    tenantSlug: 'ROYAL-BESPOKE-SLUG',
    ownerEmail: 'LATIF.OWNER@EXAMPLE.COM',
    fullName: 'Latif Master',
    password: 'securepassword123',
  };
  const dto1 = plainToInstance(SignupDto, uppercaseInput);
  assert(dto1.tenantSlug === 'royal-bespoke-slug', 'Uppercase tenantSlug transformed to lowercase');
  assert(dto1.ownerEmail === 'latif.owner@example.com', 'Uppercase ownerEmail transformed to lowercase');

  const errors1 = await validate(dto1);
  assert(errors1.length === 0, 'Transformed uppercase input passes SignupDto validation without errors');

  // 1.2 Invalid regex characters in slug
  const invalidRegexSlugs = [
    'slug_with_underscore',
    'slug!special',
    'slug@domain',
    'slug--consecutive-hyphens',
    '-leading-hyphen',
    'trailing-hyphen-',
    'slug with spaces',
  ];

  for (const badSlug of invalidRegexSlugs) {
    const badSlugInput = {
      boutiqueName: 'Test Boutique',
      tenantSlug: badSlug,
      ownerEmail: 'test@example.com',
      password: 'password123',
    };
    const dtoBadSlug = plainToInstance(SignupDto, badSlugInput);
    const errorsBadSlug = await validate(dtoBadSlug);
    const slugErr = errorsBadSlug.find((e) => e.property === 'tenantSlug');
    assert(!!slugErr, `Invalid regex slug '${badSlug}' rejected by SignupDto validation`);
  }

  // 1.3 Short slugs (< 3 chars)
  const shortSlugInput = {
    boutiqueName: 'Test Boutique',
    tenantSlug: 'ab',
    ownerEmail: 'test@example.com',
    password: 'password123',
  };
  const dtoShortSlug = plainToInstance(SignupDto, shortSlugInput);
  const errorsShortSlug = await validate(dtoShortSlug);
  const shortSlugErr = errorsShortSlug.find((e) => e.property === 'tenantSlug');
  assert(!!shortSlugErr, "Short slug 'ab' (< 3 chars) rejected by SignupDto @Length(3, 50) validation");

  // 1.4 Missing required fields (e.g. boutiqueName)
  const missingNameInput = {
    tenantSlug: 'valid-slug',
    ownerEmail: 'test@example.com',
    password: 'password123',
  };
  const dtoMissingName = plainToInstance(SignupDto, missingNameInput);
  const errorsMissingName = await validate(dtoMissingName);
  const nameErr = errorsMissingName.find((e) => e.property === 'boutiqueName');
  assert(!!nameErr, 'Missing boutiqueName rejected by SignupDto @IsNotEmpty validation');

  // ----------------------------------------------------
  // TEST SUITE 2: OnboardingService Unit Logic & Verification
  // ----------------------------------------------------
  console.log('\n[Suite 2: OnboardingService Input Checks]');

  // Create mock PrismaService & JwtService
  const mockPrisma: any = {
    tenant: {
      findUnique: async ({ where }: any) => {
        if (where.slug === 'already-taken') {
          return { id: 't-1', slug: 'already-taken' };
        }
        return null;
      },
    },
    user: {
      findUnique: async ({ where }: any) => {
        if (where.email === 'taken@example.com') {
          return { id: 'u-1', email: 'taken@example.com' };
        }
        return null;
      },
    },
    $transaction: async (cb: any) => {
      return cb(mockPrisma);
    },
  };

  const mockJwt: any = {
    sign: () => 'mock-jwt-token',
  };

  const service = new OnboardingService(mockPrisma, mockJwt);

  // 2.1 checkSlug with invalid format (< 3 chars, invalid chars, reserved keyword)
  const resShort = await service.checkSlug('ab');
  assert(resShort.available === false && resShort.reason === 'INVALID_FORMAT', 'checkSlug("ab") returns available: false, INVALID_FORMAT');

  const resReserved = await service.checkSlug('admin');
  assert(resReserved.available === false && resReserved.reason === 'SLUG_RESERVED', 'checkSlug("admin") returns available: false, SLUG_RESERVED');

  const resTaken = await service.checkSlug('already-taken');
  assert(resTaken.available === false && resTaken.reason === 'SLUG_TAKEN', 'checkSlug("already-taken") returns available: false, SLUG_TAKEN');

  const resValid = await service.checkSlug('fresh-slug');
  assert(resValid.available === true && resValid.reason === null, 'checkSlug("fresh-slug") returns available: true');

  // 2.2 signup validation checks
  try {
    await service.signup(plainToInstance(SignupDto, { boutiqueName: 'Boutique', tenantSlug: 'ab', ownerName: 'Owner', ownerEmail: 'o@e.com', password: 'pass123' }));
    assert(false, 'signup with short slug should throw BadRequestException');
  } catch (err: any) {
    assert(err instanceof BadRequestException, 'signup with short slug throws BadRequestException');
  }

  try {
    await service.signup(plainToInstance(SignupDto, { boutiqueName: 'Boutique', tenantSlug: 'valid-slug', ownerName: '', ownerEmail: 'o@e.com', password: 'pass123' }));
    assert(false, 'signup with empty owner name should throw BadRequestException');
  } catch (err: any) {
    assert(err instanceof BadRequestException, 'signup with empty owner name throws BadRequestException');
  }

  try {
    await service.signup(plainToInstance(SignupDto, { boutiqueName: 'Boutique', tenantSlug: 'valid-slug', ownerName: 'Owner', ownerEmail: 'invalid-email', password: 'pass123' }));
    assert(false, 'signup with invalid owner email should throw BadRequestException');
  } catch (err: any) {
    assert(err instanceof BadRequestException, 'signup with invalid owner email throws BadRequestException');
  }

  try {
    await service.signup(plainToInstance(SignupDto, { boutiqueName: 'Boutique', tenantSlug: 'valid-slug', ownerName: 'Owner', ownerEmail: 'o@e.com', password: '123' }));
    assert(false, 'signup with short password should throw BadRequestException');
  } catch (err: any) {
    assert(err instanceof BadRequestException, 'signup with short password throws BadRequestException');
  }

  // ----------------------------------------------------
  // TEST SUITE 3: Prisma P2002 Conflict Exception Handling
  // ----------------------------------------------------
  console.log('\n[Suite 3: Prisma P2002 Duplicate Error Mapping]');

  const mockPrismaP2002: any = {
    tenant: {
      findUnique: async () => null,
    },
    user: {
      findUnique: async () => null,
    },
    $transaction: async () => {
      const p2002Error: any = new Error('Unique constraint failed on the fields: (`slug`)');
      p2002Error.code = 'P2002';
      p2002Error.meta = { target: ['slug'] };
      throw p2002Error;
    },
  };

  const serviceP2002 = new OnboardingService(mockPrismaP2002, mockJwt);
  const validSignupData = plainToInstance(SignupDto, {
    boutiqueName: 'Test Boutique',
    tenantSlug: 'DUPLICATE-SLUG',
    ownerEmail: 'OWNER@EXAMPLE.COM',
    fullName: 'Owner Name',
    password: 'password123',
  });

  try {
    await serviceP2002.signup(validSignupData);
    assert(false, 'signup should throw ConflictException on Prisma P2002 error');
  } catch (err: any) {
    assert(err instanceof ConflictException, 'signup throws NestJS ConflictException on Prisma P2002 duplicate error');
    assert(err.getStatus() === 409, 'ConflictException has HTTP status code 409');
    assert(err.message === 'Tenant slug or owner email is already registered', 'ConflictException has accurate error message');
  }

  console.log(`\n========================================`);
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Unhandled error in test runner:', err);
  process.exit(1);
});
