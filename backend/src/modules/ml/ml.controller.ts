import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { sendError, sendSuccess } from '../../utils/response';
import { getExceptionPredictions, getPredictions } from './ml.service';

export async function listPredictions(_req: AuthRequest, res: Response): Promise<void> {
  sendSuccess(res, await getPredictions());
}

export async function listExceptionPredictions(req: AuthRequest, res: Response): Promise<void> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!id) {
    sendError(res, 'Exception ID is required', 400, 'VALIDATION_ERROR');
    return;
  }
  sendSuccess(res, await getExceptionPredictions(id));
}
