import { apiClient, ApiResponse } from './client';

export const authApi = {
  login: async (email: string, password: string): Promise<ApiResponse> => {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.success && (response.data as any)?.token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('insureflow_token', (response.data as any).token);
      }
    }
    return response;
  },

  logout: async (): Promise<ApiResponse> => {
    const response = await apiClient.post('/auth/logout');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('insureflow_token');
    }
    return response;
  },

  getMe: async (): Promise<ApiResponse> => {
    return apiClient.get('/auth/me');
  },
};
