import { apiClient, ApiResponse } from './client';

export const paymentsApi = {
  getPayments: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    paymentMethod?: string;
    policyId?: string;
    invoiceId?: string;
  }): Promise<ApiResponse> => {
    return apiClient.get('/payments', params);
  },

  getPaymentById: async (id: string): Promise<ApiResponse> => {
    return apiClient.get(`/payments/${id}`);
  },
};
