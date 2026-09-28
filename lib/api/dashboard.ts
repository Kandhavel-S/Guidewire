import { apiClient, ApiResponse } from './client';

export const dashboardApi = {
  getSummary: async (): Promise<ApiResponse> => {
    return apiClient.get('/dashboard/summary');
  },

  getPremiumTrend: async (): Promise<ApiResponse> => {
    return apiClient.get('/dashboard/premium-trend');
  },

  getExceptionDistribution: async (): Promise<ApiResponse> => {
    return apiClient.get('/dashboard/exception-distribution');
  },

  getSeverityDistribution: async (): Promise<ApiResponse> => {
    return apiClient.get('/dashboard/severity-distribution');
  },

  getRecentExceptions: async (): Promise<ApiResponse> => {
    return apiClient.get('/dashboard/recent-exceptions');
  },
};
