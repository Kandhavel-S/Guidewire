import { Router } from 'express';
import {
  analyzeException,
  generateSummary,
  chatWithAI,
  getDashboardInsights,
  naturalLanguageSearch,
} from './ai.controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();
router.use(requireAuth);

router.post('/exceptions/:id/analyze', analyzeException);
router.post('/exceptions/:id/summary', generateSummary);
router.post('/exceptions/:id/chat', chatWithAI);
router.post('/dashboard-insights', getDashboardInsights);
router.post('/search', naturalLanguageSearch);

export default router;
