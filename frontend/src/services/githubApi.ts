const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description?: string;
  private: boolean;
  html_url: string;
  language?: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  updated_at: string;
  created_at: string;
  default_branch: string;
}

export interface PaginationInfo {
  page: number;
  per_page: number;
  total: number;
  has_next: boolean;
}

export interface ReposResponse {
  repos: GitHubRepo[];
  pagination: PaginationInfo;
}

export const githubApi = {
  async getProfile() {
    const response = await fetch(`${API_URL}/api/github/profile`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch GitHub profile');
    }

    return response.json();
  },

  async getRepos(params: {
    page?: number;
    per_page?: number;
    sort?: 'updated' | 'created' | 'pushed' | 'full_name';
    type?: 'all' | 'owner' | 'public' | 'private' | 'member';
    search?: string;
  } = {}): Promise<ReposResponse> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.type) queryParams.append('type', params.type);
    if (params.search) queryParams.append('search', params.search);

    const response = await fetch(`${API_URL}/api/github/repos?${queryParams}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch repositories');
    }

    return response.json();
  },

  async disconnect() {
    const response = await fetch(`${API_URL}/api/github/disconnect`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to disconnect GitHub');
    }

    return response.json();
  },

  async sync() {
    const response = await fetch(`${API_URL}/api/github/sync`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to sync GitHub profile');
    }

    return response.json();
  },
};
