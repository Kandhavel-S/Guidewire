import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
export declare function startReconciliation(req: AuthRequest, res: Response): Promise<void>;
export declare function getReconciliationRuns(req: AuthRequest, res: Response): Promise<void>;
export declare function getReconciliationRunById(req: AuthRequest, res: Response): Promise<void>;
export declare function getLatestReconciliationResults(req: AuthRequest, res: Response): Promise<void>;
//# sourceMappingURL=reconciliation.controller.d.ts.map