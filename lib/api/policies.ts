import { apiClient, ApiResponse } from './client';

export const policiesApi = {
  getPolicies: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    status?: string;
    sort?: string;
    order?: string;
  }): Promise<ApiResponse> => {
    return apiClient.get('/policies', params);
  },

  getPolicyById: async (id: string): Promise<ApiResponse> => {
    return apiClient.get(`/policies/${id}`);
  },
};
