import { Router } from 'express';
import { getInvoices, getInvoiceById } from './invoices.controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();
router.use(requireAuth);
router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
export default router;
