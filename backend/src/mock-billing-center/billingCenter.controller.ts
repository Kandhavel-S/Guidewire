import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { billingCenterService } from './billingCenter.service';
import { sendSuccess, sendError, getPaginationParams } from '../utils/response';

export async function bcGetPolicies(req: AuthRequest, res: Response): Promise<void> {
  const { page, limit } = getPaginationParams(req.query as Record<string, unknown>);
  const { search, type, status } = req.query as Record<string, string>;
  const result = await billingCenterService.getPolicies({ page, limit, search, type, status });
  sendSuccess(res, result);
}

export async function bcGetPolicyById(req: AuthRequest, res: Response): Promise<void> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const policy = await billingCenterService.getPolicyById(id);
  if (!policy) { sendError(res, 'Policy not found', 404, 'BC_POLICY_NOT_FOUND'); return; }
  sendSuccess(res, policy);
}

export async function bcGetInvoices(req: AuthRequest, res: Response): Promise<void> {
  const { page, limit } = getPaginationParams(req.query as Record<string, unknown>);
  const { policyId, status } = req.query as Record<string, string>;
  const result = await billingCenterService.getInvoices({ page, limit, policyId, status });
  sendSuccess(res, result);
}

export async function bcGetInvoiceById(req: AuthRequest, res: Response): Promise<void> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const invoice = await billingCenterService.getInvoiceById(id);
  if (!invoice) { sendError(res, 'Invoice not found', 404, 'BC_INVOICE_NOT_FOUND'); return; }
  sendSuccess(res, invoice);
}

export async function bcGetPayments(req: AuthRequest, res: Response): Promise<void> {
  const { page, limit } = getPaginationParams(req.query as Record<string, unknown>);
  const { invoiceId, status } = req.query as Record<string, string>;
  const result = await billingCenterService.getPayments({ page, limit, invoiceId, status });
  sendSuccess(res, result);
}

export async function bcGetPaymentById(req: AuthRequest, res: Response): Promise<void> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const payment = await billingCenterService.getPaymentById(id);
  if (!payment) { sendError(res, 'Payment not found', 404, 'BC_PAYMENT_NOT_FOUND'); return; }
  sendSuccess(res, payment);
}

export async function bcGetAccounts(req: AuthRequest, res: Response): Promise<void> {
  const { page, limit } = getPaginationParams(req.query as Record<string, unknown>);
  const { policyId } = req.query as Record<string, string>;
  const result = await billingCenterService.getAccounts({ page, limit, policyId });
  sendSuccess(res, result);
}

export async function bcGetAccountById(req: AuthRequest, res: Response): Promise<void> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const account = await billingCenterService.getAccountById(id);
  if (!account) { sendError(res, 'Account not found', 404, 'BC_ACCOUNT_NOT_FOUND'); return; }
  sendSuccess(res, account);
}
