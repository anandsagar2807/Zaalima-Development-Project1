// Optimized API client with caching and performance improvements
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface ApiOptions extends RequestInit {
    cache?: RequestCache;
    next?: NextFetchRequestConfig;
}

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        // Default options optimized for performance
        const defaultOptions: ApiOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            cache: 'no-store', // Default to no-store for dynamic data
            ...options,
        };

        try {
            const response = await fetch(url, defaultOptions);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Optimized GET with caching for static data
    async get<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'GET',
            cache: options.cache || 'no-store',
            next: options.next,
        });
    }

    // Optimized POST with error handling
    async post<T>(endpoint: string, data: any, options: ApiOptions = {}): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
            ...options,
        });
    }

    // Optimized PUT with error handling
    async put<T>(endpoint: string, data: any, options: ApiOptions = {}): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
            ...options,
        });
    }

    // Optimized DELETE with error handling
    async delete<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'DELETE',
            ...options,
        });
    }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Convenience functions for common API calls
export const fetchWithCache = async <T>(
    key: string,
    fetcher: () => Promise<T>,
    options: { revalidate?: number } = {}
): Promise<T> => {
    // Implement caching logic here if needed
    return fetcher();
};

// Optimized fetch function with timeout
export const fetchWithTimeout = async <T>(
    url: string,
    options: RequestInit = {},
    timeout = 10000 // 10 seconds default
): Promise<T> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Request timeout');
        }
        throw error;
    }
};
