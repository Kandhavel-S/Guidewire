import { Router } from 'express';
import { getPayments, getPaymentById } from './payments.controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();
router.use(requireAuth);
router.get('/', getPayments);
router.get('/:id', getPaymentById);
export default router;
