export type UserRole =
  | 'SUPER_ADMIN'
  | 'ATELIER_MANAGER'
  | 'MASTER_TAILOR'
  | 'EMBROIDERY_ARTISAN'
  | 'SALES_FRONT_DESK'
  | 'QUALITY_INSPECTOR'
  | 'CUSTOMER_VIEW';

export interface RolePermissions {
  allowedRoutes: string[];
  defaultLanding: string;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  SUPER_ADMIN: {
    allowedRoutes: [
      '/admin',
      '/dashboard',
      '/customers',
      '/measurements',
      '/orders',
      '/production',
      '/staff',
      '/onboarding',
      '/redhouse',
      '/redhouse/marketplace',
      '/redhouse/equipment',
      '/redhouse/supply',
      '/redhouse/bidding',
      '/redhouse/stylists',
      '/marketplace',
      '/equipment',
      '/supply',
      '/bidding',
      '/stylists',
    ],
    defaultLanding: '/admin',
  },
  ATELIER_MANAGER: {
    allowedRoutes: [
      '/dashboard',
      '/customers',
      '/measurements',
      '/orders',
      '/production',
      '/staff',
      '/redhouse',
      '/redhouse/marketplace',
      '/redhouse/equipment',
      '/redhouse/supply',
      '/redhouse/bidding',
      '/redhouse/stylists',
      '/marketplace',
      '/equipment',
      '/supply',
      '/bidding',
      '/stylists',
    ],
    defaultLanding: '/dashboard',
  },
  MASTER_TAILOR: {
    allowedRoutes: [
      '/dashboard',
      '/customers',
      '/measurements',
      '/orders',
      '/production',
      '/redhouse',
      '/redhouse/marketplace',
      '/redhouse/equipment',
      '/redhouse/supply',
      '/redhouse/bidding',
      '/redhouse/stylists',
      '/marketplace',
      '/equipment',
      '/supply',
      '/bidding',
      '/stylists',
    ],
    defaultLanding: '/dashboard',
  },
  EMBROIDERY_ARTISAN: {
    allowedRoutes: [
      '/production', 
      '/measurements', 
      '/redhouse',
      '/redhouse/bidding', 
      '/redhouse/equipment', 
      '/redhouse/stylists',
      '/bidding', 
      '/equipment', 
      '/stylists'
    ],
    defaultLanding: '/production',
  },
  SALES_FRONT_DESK: {
    allowedRoutes: [
      '/dashboard', 
      '/customers', 
      '/measurements', 
      '/orders', 
      '/redhouse',
      '/redhouse/marketplace', 
      '/redhouse/stylists', 
      '/redhouse/supply',
      '/marketplace', 
      '/stylists', 
      '/supply'
    ],
    defaultLanding: '/orders',
  },
  QUALITY_INSPECTOR: {
    allowedRoutes: [
      '/dashboard', 
      '/orders', 
      '/production', 
      '/measurements', 
      '/redhouse',
      '/redhouse/marketplace', 
      '/redhouse/supply', 
      '/redhouse/equipment',
      '/marketplace', 
      '/supply', 
      '/equipment'
    ],
    defaultLanding: '/production',
  },
  CUSTOMER_VIEW: {
    allowedRoutes: [
      '/orders', 
      '/measurements', 
      '/redhouse',
      '/redhouse/marketplace', 
      '/redhouse/stylists',
      '/marketplace', 
      '/stylists'
    ],
    defaultLanding: '/orders',
  },
};

export function normalizeRole(role: string): UserRole | null {
  if (!role || typeof role !== 'string') return null;
  const r = role.toUpperCase().trim();
  if (r === 'SUPER_ADMIN' || r === 'SYSTEM_ADMIN') return 'SUPER_ADMIN';
  if (r === 'ATELIER_MANAGER' || r === 'TENANT_OWNER' || r === 'BRANCH_MANAGER') return 'ATELIER_MANAGER';
  if (r === 'MASTER_TAILOR') return 'MASTER_TAILOR';
  if (r === 'EMBROIDERY_ARTISAN' || r === 'KARIGAR') return 'EMBROIDERY_ARTISAN';
  if (r === 'SALES_FRONT_DESK' || r === 'RECEPTIONIST') return 'SALES_FRONT_DESK';
  if (r === 'QUALITY_INSPECTOR') return 'QUALITY_INSPECTOR';
  if (r === 'CUSTOMER_VIEW' || r === 'CUSTOMER') return 'CUSTOMER_VIEW';
  return null;
}

export function canUserAccessRoute(role: UserRole | string, routePath: string): boolean {
  if (!role || !routePath) return false;
  const userRole = normalizeRole(role);
  if (!userRole) return false;
  let normalizedPath = routePath.split('?')[0].split('#')[0];
  while (normalizedPath.includes('/../') || normalizedPath.includes('/./')) {
    normalizedPath = normalizedPath.replace(/\/[^\/]+\/\.\.\//g, '/').replace(/\/\.\//g, '/');
  }
  const permissions = ROLE_PERMISSIONS[userRole];
  if (!permissions) return false;
  
  return permissions.allowedRoutes.some(
    (allowed) => normalizedPath === allowed || normalizedPath.startsWith(`${allowed}/`)
  );
}

export function filterNavItemsForRole<T extends { href: string }>(items: T[], role: UserRole | string): T[] {
  if (!role) return [];
  const normalized = normalizeRole(role);
  if (!normalized) return [];
  return items.filter((item) => canUserAccessRoute(normalized, item.href));
}

export function getFallbackRedirectRoute(role: UserRole | string, attemptedRoute: string): string {
  if (!role) return '/login';
  const normalized = normalizeRole(role);
  if (!normalized) return '/login';
  
  if (canUserAccessRoute(normalized, attemptedRoute)) {
    return attemptedRoute;
  }
  return ROLE_PERMISSIONS[normalized]?.defaultLanding || '/login';
}

