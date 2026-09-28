import { Router } from 'express';
import {
  startReconciliation,
  getReconciliationRuns,
  getReconciliationRunById,
  getLatestReconciliationResults,
} from './reconciliation.controller';
import { requireAuth } from '../../middleware/auth';
import { requireMinRole } from '../../middleware/rbac';

const router = Router();
router.use(requireAuth);

router.post('/run', requireMinRole('FINANCE_ANALYST'), startReconciliation);
router.get('/runs', getReconciliationRuns);
router.get('/runs/:id', getReconciliationRunById);
router.get('/results', getLatestReconciliationResults);

export default router;
