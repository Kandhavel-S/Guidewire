import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
export declare function analyzeException(req: AuthRequest, res: Response): Promise<void>;
export declare function generateSummary(req: AuthRequest, res: Response): Promise<void>;
export declare function chatWithAI(req: AuthRequest, res: Response): Promise<void>;
export declare function getDashboardInsights(_req: AuthRequest, res: Response): Promise<void>;
export declare function naturalLanguageSearch(req: AuthRequest, res: Response): Promise<void>;
//# sourceMappingURL=ai.controller.d.ts.map