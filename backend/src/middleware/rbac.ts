import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

type Role = 'ADMIN' | 'FINANCE_ANALYST' | 'OPERATIONS_USER' | 'VIEWER';

// Role hierarchy: ADMIN > FINANCE_ANALYST > OPERATIONS_USER > VIEWER
const ROLE_LEVELS: Record<Role, number> = {
  ADMIN: 4,
  FINANCE_ANALYST: 3,
  OPERATIONS_USER: 2,
  VIEWER: 1,
};

export function requireRole(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'UNAUTHORIZED',
      });
      return;
    }

    const userRole = req.user.role as Role;
    const hasPermission = roles.some((role) => {
      // User must have at least the required role level
      return ROLE_LEVELS[userRole] >= ROLE_LEVELS[role];
    });

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        code: 'FORBIDDEN',
        required: roles,
        current: userRole,
      });
      return;
    }

    next();
  };
}

export function requireMinRole(minRole: Role) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const userRole = req.user.role as Role;
    if (ROLE_LEVELS[userRole] < ROLE_LEVELS[minRole]) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        code: 'FORBIDDEN',
      });
      return;
    }

    next();
  };
}
