import { apiClient, ApiResponse } from './client';

export const reconciliationApi = {
  startReconciliation: async (): Promise<ApiResponse> => {
    return apiClient.post('/reconciliation/run');
  },

  getRuns: async (params?: { page?: number; limit?: number }): Promise<ApiResponse> => {
    return apiClient.get('/reconciliation/runs', params);
  },

  getRunById: async (id: string): Promise<ApiResponse> => {
    return apiClient.get(`/reconciliation/runs/${id}`);
  },

  getLatestResults: async (): Promise<ApiResponse> => {
    return apiClient.get('/reconciliation/results');
  },
};
