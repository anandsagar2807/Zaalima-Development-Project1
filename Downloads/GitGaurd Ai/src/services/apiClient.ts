// Unified API Client for GitGuard AI Frontend
// Handles all backend communication with auth, interceptors, and error handling

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface ApiError {
  message: string;
  status: number;
  data?: any;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add any auth tokens or custom headers here if needed
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const apiError: ApiError = {
          message: 'An error occurred',
          status: error.response?.status || 500,
          data: error.response?.data,
        };

        if (error.response) {
          // Server responded with error status
          const data = error.response.data as any;
          apiError.message = data?.error || data?.message || 'Server error';

          // Handle specific status codes
          if (error.response.status === 401) {
            // Unauthorized - redirect to login
            apiError.message = 'Session expired. Please login again.';
            window.location.href = '/sign-in';
          } else if (error.response.status === 403) {
            apiError.message = 'Access denied';
          } else if (error.response.status === 404) {
            apiError.message = 'Resource not found';
          } else if (error.response.status >= 500) {
            apiError.message = 'Server error. Please try again later.';
          }
        } else if (error.request) {
          // Request made but no response
          apiError.message = 'Network error. Please check your connection.';
        } else {
          // Error in request setup
          apiError.message = error.message || 'Request failed';
        }

        return Promise.reject(apiError);
      }
    );
  }

  // Generic request methods
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.patch<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }
}

// Create singleton instance
const apiClient = new ApiClient();

// Export API methods
export const api = {
  // Auth
  auth: {
    me: () => apiClient.get<{ user: any }>('/auth/me'),
    logout: () => apiClient.post('/auth/logout'),
  },

  // Dashboard
  dashboard: {
    getSummary: () => apiClient.get<{ summary: any }>('/dashboard/summary'),
  },

  // Repositories
  repositories: {
    getAll: () => apiClient.get<{ repositories: any[] }>('/repositories'),
    toggle: (id: string, field: string) =>
      apiClient.put<{ success: boolean }>('/repositories', { id, field }),
  },

  // Pull Requests
  pullRequests: {
    getAll: (filters?: { severity?: string; type?: string; autofix?: boolean }) =>
      apiClient.get<{ pullRequests: any[] }>('/pull-requests', filters),
    getById: (id: string) => apiClient.get<{ pullRequest: any }>(`/pull-requests/${id}`),
  },

  // Reviews
  reviews: {
    getAll: (prId?: string) =>
      apiClient.get<{ reviews: any[] }>('/reviews', prId ? { prId } : undefined),
    update: (id: string, status: string) =>
      apiClient.put<{ success: boolean }>('/reviews', { id, status }),
  },

  // Security
  security: {
    getIssues: (filters?: { severity?: string; repo?: string }) =>
      apiClient.get<{ issues: any[] }>('/security', filters),
    updateIssue: (id: string, status: string) =>
      apiClient.put<{ success: boolean }>('/security', { id, status }),
  },

  // Performance
  performance: {
    getIssues: () => apiClient.get<{ issues: any[] }>('/performance'),
  },

  // Rules
  rules: {
    getAll: () => apiClient.get<{ rules: any[] }>('/rules'),
    toggle: (ruleId: string) => apiClient.put<{ success: boolean }>('/rules', { ruleId }),
    applyGlobally: (enabled: boolean) =>
      apiClient.put<{ success: boolean }>('/rules', { enabled }),
  },

  // Settings
  settings: {
    get: () => apiClient.get<{ settings: any }>('/settings'),
    update: (settings: any) => apiClient.put<{ settings: any }>('/settings', settings),
  },

  // Analytics
  analytics: {
    get: () =>
      apiClient.get<{
        analytics: any;
        prsPerDayData: any[];
        issuesBySeverity: any[];
        securityVsBugData: any[];
      }>('/analytics'),
  },

  // Webhooks/Logs
  webhooks: {
    getLogs: (filters?: { status?: string }) =>
      apiClient.get<{ logs: any[] }>('/webhooks', filters),
  },

  // GitHub
  github: {
    getProfile: () => apiClient.get<{ profile: any }>('/github/profile'),
    getRepos: (params?: {
      page?: string;
      per_page?: string;
      sort?: string;
      type?: string;
      search?: string;
    }) => apiClient.get<{ repos: any[]; pagination: any }>('/github/repos', params),
    disconnect: () => apiClient.post<{ message: string }>('/github/disconnect'),
    sync: () => apiClient.post<{ message: string }>('/github/sync'),
  },
};

export default api;
