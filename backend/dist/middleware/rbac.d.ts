import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
type Role = 'ADMIN' | 'FINANCE_ANALYST' | 'OPERATIONS_USER' | 'VIEWER';
export declare function requireRole(...roles: Role[]): (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare function requireMinRole(minRole: Role): (req: AuthRequest, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=rbac.d.ts.map