import { apiClient, ApiResponse } from './client';

export const aiApi = {
  analyzeException: async (id: string): Promise<ApiResponse> => {
    return apiClient.post(`/ai/exceptions/${id}/analyze`);
  },

  generateSummary: async (id: string): Promise<ApiResponse> => {
    return apiClient.post(`/ai/exceptions/${id}/summary`);
  },

  chatWithAI: async (id: string, message: string): Promise<ApiResponse> => {
    return apiClient.post(`/ai/exceptions/${id}/chat`, { message });
  },

  getDashboardInsights: async (): Promise<ApiResponse> => {
    return apiClient.post('/ai/dashboard-insights');
  },

  naturalLanguageSearch: async (query: string): Promise<ApiResponse> => {
    return apiClient.post('/ai/search', { query });
  },
};
