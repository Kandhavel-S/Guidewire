import { apiClient, ApiResponse } from './client';

export const invoicesApi = {
  getInvoices: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    policyId?: string;
    sort?: string;
    order?: string;
  }): Promise<ApiResponse> => {
    return apiClient.get('/invoices', params);
  },

  getInvoiceById: async (id: string): Promise<ApiResponse> => {
    return apiClient.get(`/invoices/${id}`);
  },
};
