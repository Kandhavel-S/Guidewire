import { Router } from 'express';
import {
  getDashboardSummary,
  getPremiumTrend,
  getExceptionDistribution,
  getSeverityDistribution,
  getRecentExceptions,
} from './dashboard.controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();
router.use(requireAuth);

router.get('/summary', getDashboardSummary);
router.get('/premium-trend', getPremiumTrend);
router.get('/exception-distribution', getExceptionDistribution);
router.get('/severity-distribution', getSeverityDistribution);
router.get('/recent-exceptions', getRecentExceptions);

export default router;
