import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare function bcGetPolicies(req: AuthRequest, res: Response): Promise<void>;
export declare function bcGetPolicyById(req: AuthRequest, res: Response): Promise<void>;
export declare function bcGetInvoices(req: AuthRequest, res: Response): Promise<void>;
export declare function bcGetInvoiceById(req: AuthRequest, res: Response): Promise<void>;
export declare function bcGetPayments(req: AuthRequest, res: Response): Promise<void>;
export declare function bcGetPaymentById(req: AuthRequest, res: Response): Promise<void>;
export declare function bcGetAccounts(req: AuthRequest, res: Response): Promise<void>;
export declare function bcGetAccountById(req: AuthRequest, res: Response): Promise<void>;
//# sourceMappingURL=billingCenter.controller.d.ts.map