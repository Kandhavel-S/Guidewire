import { Router } from 'express';
import { getPolicies, getPolicyById } from './policies.controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/', getPolicies);
router.get('/:id', getPolicyById);

export default router;
