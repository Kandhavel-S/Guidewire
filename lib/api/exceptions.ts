import { apiClient, ApiResponse } from './client';

export const exceptionsApi = {
  getExceptions: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    severity?: string;
    status?: string;
    assigneeId?: string;
    sort?: string;
    order?: string;
  }): Promise<ApiResponse> => {
    return apiClient.get('/exceptions', params);
  },

  getExceptionById: async (id: string): Promise<ApiResponse> => {
    return apiClient.get(`/exceptions/${id}`);
  },

  updateStatus: async (id: string, status: string): Promise<ApiResponse> => {
    return apiClient.patch(`/exceptions/${id}/status`, { status });
  },

  assignException: async (id: string, assignedToId: string | null): Promise<ApiResponse> => {
    return apiClient.patch(`/exceptions/${id}/assign`, { assignedToId });
  },

  addNote: async (id: string, content: string): Promise<ApiResponse> => {
    return apiClient.post(`/exceptions/${id}/notes`, { content });
  },

  resolveException: async (id: string, note?: string): Promise<ApiResponse> => {
    return apiClient.post(`/exceptions/${id}/resolve`, { note });
  },
};
