import { apiClient, ApiResponse } from './client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const reportsApi = {
  getReconciliationReport: async (): Promise<ApiResponse> => {
    return apiClient.get('/reports/reconciliation');
  },

  getExceptionsReport: async (): Promise<ApiResponse> => {
    return apiClient.get('/reports/exceptions');
  },

  getPaymentsReport: async (): Promise<ApiResponse> => {
    return apiClient.get('/reports/payments');
  },

  getExceptionsCSVUrl: (): string => {
    return `${API_BASE_URL}/reports/exceptions/export`;
  },

  getReconciliationCSVUrl: (): string => {
    return `${API_BASE_URL}/reports/reconciliation/export`;
  },

  getPaymentsCSVUrl: (): string => {
    return `${API_BASE_URL}/reports/payments/export`;
  },
};
