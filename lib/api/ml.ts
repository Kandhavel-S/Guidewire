import { apiClient, ApiResponse } from './client';

export interface MLPrediction {
  id: string;
  paymentId?: string | null;
  exceptionId?: string | null;
  predictionType: 'PAYMENT_ANOMALY' | 'LATE_PAYMENT';
  modelName: string;
  modelVersion: string;
  score: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  prediction?: boolean | null;
  features?: Record<string, number> | null;
  createdAt: string;
  payment?: {
    transactionId: string;
    amount: number | string;
    policy?: { policyNumber: string; policyholder?: { name: string } };
  } | null;
  exception?: { exceptionNumber: string; type: string } | null;
}

export const mlApi = {
  getPredictions: async (): Promise<ApiResponse<MLPrediction[]>> => apiClient.get('/ml/predictions'),
  getExceptionPredictions: async (id: string): Promise<ApiResponse<MLPrediction[]>> =>
    apiClient.get(`/ml/exceptions/${id}`),
};
