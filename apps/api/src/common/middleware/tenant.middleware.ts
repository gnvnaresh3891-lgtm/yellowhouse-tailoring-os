import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export interface TenantRequest extends Request {
  tenantId?: string;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: TenantRequest, res: Response, next: NextFunction) {
    const tenantId = req.headers['x-tenant-id'] as string;
    
    // In development mode or default routes, allow fallback tenant
    if (!tenantId) {
      req.tenantId = 'default-tenant-id';
    } else {
      req.tenantId = tenantId;
    }
    
    next();
  }
}
