import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
export declare function getExceptions(req: AuthRequest, res: Response): Promise<void>;
export declare function getExceptionById(req: AuthRequest, res: Response): Promise<void>;
export declare function updateExceptionStatus(req: AuthRequest, res: Response): Promise<void>;
export declare function assignException(req: AuthRequest, res: Response): Promise<void>;
export declare function addExceptionNote(req: AuthRequest, res: Response): Promise<void>;
export declare function resolveException(req: AuthRequest, res: Response): Promise<void>;
//# sourceMappingURL=exceptions.controller.d.ts.map