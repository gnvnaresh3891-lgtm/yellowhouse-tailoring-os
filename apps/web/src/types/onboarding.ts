export interface TenantPayload {
  id: string;
  name: string;
  slug: string;
  plan?: string;
  status?: string;
}

export interface UserPayload {
  id: string;
  email: string;
  name: string;
  role: 'TENANT_OWNER' | 'BRANCH_MANAGER' | 'RECEPTIONIST' | 'MASTER_TAILOR' | 'KARIGAR' | 'SYSTEM_ADMIN';
  tenantId?: string;
  branchId?: string;
}

export interface SignupResponse {
  success: boolean;
  tenant: TenantPayload;
  user: UserPayload;
  token: string;
  seededTemplatesCount?: number;
  message?: string;
  error?: string;
}

export interface SlugCheckResponse {
  available: boolean;
  slug: string;
  reason?: string | null;
  message?: string;
}

export type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

export interface SlugCheckerState {
  status: SlugStatus;
  message: string;
}

export interface TemplateOption {
  id: string;
  name: string;
  category: string;
  description: string;
  pomsCount: number;
  popular?: boolean;
}

export interface OnboardingFormState {
  boutiqueName: string;
  slug: string;
  isSlugManuallyEdited: boolean;
  templates: string[];
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}
