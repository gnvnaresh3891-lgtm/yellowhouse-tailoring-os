import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';

export enum UserRole {
  TENANT_OWNER = 'TENANT_OWNER',
  BRANCH_MANAGER = 'BRANCH_MANAGER',
  RECEPTIONIST = 'RECEPTIONIST',
  MASTER_TAILOR = 'MASTER_TAILOR',
  KARIGAR = 'KARIGAR',
  ACCOUNTANT = 'ACCOUNTANT',
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
}

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsNotEmpty()
  @IsString()
  tenantId: string;

  @IsOptional()
  @IsString()
  branchId?: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class CreateTenantDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  slug: string;

  @IsNotEmpty()
  @IsString()
  ownerName: string;

  @IsEmail()
  ownerEmail: string;

  @IsNotEmpty()
  @MinLength(8)
  ownerPassword: string;

  @IsOptional()
  @IsString()
  plan?: string;

  @IsOptional()
  templateCategories?: string[];
}
