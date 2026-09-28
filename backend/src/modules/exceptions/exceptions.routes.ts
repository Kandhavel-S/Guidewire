import { Router } from 'express';
import {
  getExceptions,
  getExceptionById,
  updateExceptionStatus,
  assignException,
  addExceptionNote,
  resolveException,
} from './exceptions.controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();
router.use(requireAuth);

router.get('/', getExceptions);
router.get('/:id', getExceptionById);
router.patch('/:id/status', updateExceptionStatus);
router.patch('/:id/assign', assignException);
router.post('/:id/notes', addExceptionNote);
router.post('/:id/resolve', resolveException);

export default router;
