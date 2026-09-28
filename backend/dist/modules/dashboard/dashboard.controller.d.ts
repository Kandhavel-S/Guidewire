import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
export declare function getDashboardSummary(_req: AuthRequest, res: Response): Promise<void>;
export declare function getPremiumTrend(_req: AuthRequest, res: Response): Promise<void>;
export declare function getExceptionDistribution(_req: AuthRequest, res: Response): Promise<void>;
export declare function getSeverityDistribution(_req: AuthRequest, res: Response): Promise<void>;
export declare function getRecentExceptions(_req: AuthRequest, res: Response): Promise<void>;
//# sourceMappingURL=dashboard.controller.d.ts.map