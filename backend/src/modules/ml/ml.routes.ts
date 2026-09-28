import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { listExceptionPredictions, listPredictions } from './ml.controller';

const router = Router();
router.use(requireAuth);
router.get('/predictions', listPredictions);
router.get('/exceptions/:id', listExceptionPredictions);

export default router;
