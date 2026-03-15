import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance with optimized timeout
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000, // 15 second timeout for faster feedback
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refreshToken,
                    });
                    const { accessToken } = response.data.data;
                    localStorage.setItem('accessToken', accessToken);
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }, { timeout: 12000 }),
    register: (data: any) => api.post('/auth/register', data, { timeout: 12000 }),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data: any) => api.put('/auth/profile', data),
};

// Applications API
export const applicationsAPI = {
    list: (params?: any) => api.get('/applications', { params }),
    getAll: (params?: any) => api.get('/applications', { params }),
    getById: (id: string) => api.get(`/applications/${id}`),
    create: (data: any) => api.post('/applications', data),
    update: (id: string, data: any) => api.put(`/applications/${id}`, data),
    updateStatus: (id: string, status: string, reason?: string) =>
        api.put(`/applications/${id}/status`, { status, reason }),
    updateStage: (id: string, stage: string) =>
        api.put(`/applications/${id}/stage`, { stage }),
    updatePriority: (id: string, priority: string) =>
        api.put(`/applications/${id}/priority`, { priority }),
    assign: (id: string, officerId: string) =>
        api.put(`/applications/${id}/assign`, { officerId }),
    delete: (id: string) => api.delete(`/applications/${id}`),
    getStats: () => api.get('/applications/stats'),
};

// Documents API
export const documentsAPI = {
    list: (params?: any) => api.get('/documents', { params }),
    getByApplication: (applicationId: string) =>
        api.get(`/documents/${applicationId}`),
    getById: (id: string) => api.get(`/documents/detail/${id}`),
    upload: (applicationId: string, files: File[], documentTypes?: Record<string, string>) => {
        const formData = new FormData();
        files.forEach((file) => formData.append('files', file));
        if (documentTypes) {
            formData.append('documentTypes', JSON.stringify(documentTypes));
        }
        return api.post(`/documents/upload/${applicationId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    reprocess: (id: string) => api.post(`/documents/${id}/reprocess`),
    getExtraction: (id: string) => api.get(`/documents/${id}/extraction`),
    delete: (id: string) => api.delete(`/documents/${id}`),
    download: (id: string) => api.get(`/documents/${id}/download`, { responseType: 'blob' }),
};

// Scoring API
export const scoringAPI = {
    calculate: (applicationId: string) =>
        api.post(`/scoring/calculate/${applicationId}`),
    getScore: (applicationId: string) =>
        api.get(`/scoring/score/${applicationId}`),
    getBreakdown: (applicationId: string) =>
        api.get(`/scoring/breakdown/${applicationId}`),
    getExplanation: (applicationId: string) =>
        api.get(`/scoring/explain/${applicationId}`),
    getHistory: (applicationId: string) =>
        api.get(`/scoring/history/${applicationId}`),
    runSensitivity: (applicationId: string, scenarios: any[]) =>
        api.post(`/scoring/sensitivity/${applicationId}`, { scenarios }),
    getCharacter: (applicationId: string) =>
        api.get(`/scoring/character/${applicationId}`),
    getCapacity: (applicationId: string) =>
        api.get(`/scoring/capacity/${applicationId}`),
    getCapital: (applicationId: string) =>
        api.get(`/scoring/capital/${applicationId}`),
    getCollateral: (applicationId: string) =>
        api.get(`/scoring/collateral/${applicationId}`),
    getConditions: (applicationId: string) =>
        api.get(`/scoring/conditions/${applicationId}`),
};

// Research API
export const researchAPI = {
    initiate: (applicationId: string) =>
        api.post(`/research/initiate/${applicationId}`),
    getStatus: (applicationId: string) =>
        api.get(`/research/status/${applicationId}`),
    getResults: (applicationId: string) =>
        api.get(`/research/results/${applicationId}`),
    getLitigation: (applicationId: string) =>
        api.get(`/research/litigation/${applicationId}`),
    getMCA: (companyId: string) => api.get(`/research/mca/${companyId}`),
    getNews: (companyId: string) => api.get(`/research/news/${companyId}`),
};

// Primary Input API
export const primaryInputAPI = {
    get: (applicationId: string) =>
        api.get(`/primary-input/${applicationId}`),
    save: (applicationId: string, data: any) =>
        api.post(`/primary-input/${applicationId}`, data),
    update: (applicationId: string, data: any) =>
        api.put(`/primary-input/${applicationId}`, data),
    applyAdjustment: (applicationId: string, adjustment: number, reason: string) =>
        api.post(`/primary-input/${applicationId}/adjust`, { adjustment, reason }),
    logSiteVisit: (applicationId: string, data: any) =>
        api.post(`/primary-input/visits/${applicationId}`, data),
    getSiteVisits: (applicationId: string) =>
        api.get(`/primary-input/visits/${applicationId}`),
};

// CAM API
export const camAPI = {
    generate: (applicationId: string) =>
        api.post(`/cam/generate/${applicationId}`),
    get: (applicationId: string) => api.get(`/cam/${applicationId}`),
    update: (applicationId: string, data: any) =>
        api.put(`/cam/${applicationId}`, data),
    approve: (applicationId: string) =>
        api.post(`/cam/${applicationId}/approve`),
    reject: (applicationId: string) =>
        api.post(`/cam/${applicationId}/reject`),
    getPDF: (applicationId: string) =>
        api.get(`/cam/${applicationId}/pdf`, { responseType: 'blob' }),
    preview: (applicationId: string) =>
        api.get(`/cam/${applicationId}/preview`),
};

// Dashboard API
export const dashboardAPI = {
    getOverview: () => api.get('/dashboard/overview'),
    getPortfolio: () => api.get('/dashboard/portfolio'),
    getPerformance: () => api.get('/dashboard/performance'),
    getPipeline: () => api.get('/dashboard/pipeline'),
    getTurnaroundTime: (params?: any) =>
        api.get('/dashboard/analytics/turnaround-time', { params }),
    getScoreDistribution: () =>
        api.get('/dashboard/analytics/score-distribution'),
};

// Risk API
export const riskAPI = {
    getFlags: (applicationId: string) =>
        api.get(`/risk/flags/${applicationId}`),
    analyze: (applicationId: string) =>
        api.post(`/risk/analyze/${applicationId}`),
    getSummary: (applicationId: string) =>
        api.get(`/risk/summary/${applicationId}`),
    detectCircularTrading: (applicationId: string) =>
        api.post('/risk/circular-trading', { applicationId }),
    gstReconciliation: (applicationId: string) =>
        api.post('/risk/gst-reconciliation', { applicationId }),
    getSectorRisk: (sector: string) =>
        api.get(`/risk/sector/${sector}`),
    assessLitigation: (applicationId: string) =>
        api.post('/risk/litigation-impact', { applicationId }),
};

// Users API
export const usersAPI = {
    list: (params?: any) => api.get('/users', { params }),
    updateStatus: (id: string, status: string) =>
        api.patch(`/users/${id}/status`, { status }),
    getRoles: () => api.get('/users/roles'),
};

export default api;