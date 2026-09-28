import { Router } from 'express';
import {
  getReconciliationReport,
  getExceptionsReport,
  getPaymentsReport,
  exportExceptionsCSV,
  exportReconciliationCSV,
  exportPaymentsCSV,
} from './reports.controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();
router.use(requireAuth);

router.get('/reconciliation', getReconciliationReport);
router.get('/exceptions', getExceptionsReport);
router.get('/payments', getPaymentsReport);

// CSV exports
router.get('/exceptions/export', exportExceptionsCSV);
router.get('/reconciliation/export', exportReconciliationCSV);
router.get('/payments/export', exportPaymentsCSV);

export default router;
