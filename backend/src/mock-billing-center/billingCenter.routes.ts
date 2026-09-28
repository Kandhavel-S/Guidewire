import { Router } from 'express';
import {
  bcGetPolicies, bcGetPolicyById,
  bcGetInvoices, bcGetInvoiceById,
  bcGetPayments, bcGetPaymentById,
  bcGetAccounts, bcGetAccountById,
} from './billingCenter.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

router.get('/policies', bcGetPolicies);
router.get('/policies/:id', bcGetPolicyById);
router.get('/invoices', bcGetInvoices);
router.get('/invoices/:id', bcGetInvoiceById);
router.get('/payments', bcGetPayments);
router.get('/payments/:id', bcGetPaymentById);
router.get('/accounts', bcGetAccounts);
router.get('/accounts/:id', bcGetAccountById);

export default router;
