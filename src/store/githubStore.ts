import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { githubApi, GitHubRepo, ReposResponse } from '@/services/githubApi';

export interface GitHubRepository extends GitHubRepo {
  // Extended fields for UI
  visibility: 'public' | 'private';
  lastUpdatedRelative: string;
}

interface GitHubState {
  // Data
  repositories: GitHubRepository[];
  profile: any | null;

  // Pagination
  currentPage: number;
  perPage: number;
  totalRepos: number;
  hasNextPage: boolean;

  // Filters & Search
  searchQuery: string;
  sortBy: 'updated' | 'created' | 'pushed' | 'full_name';
  typeFilter: 'all' | 'owner' | 'public' | 'private' | 'member';
  languageFilter: string;

  // Loading & Error states
  isLoading: boolean;
  isLoadingProfile: boolean;
  isSyncing: boolean;
  error: string | null;

  // Actions
  fetchRepositories: (refresh?: boolean) => Promise<void>;
  fetchProfile: () => Promise<void>;
  syncProfile: () => Promise<void>;
  disconnectGitHub: () => Promise<void>;

  // Filters
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: 'updated' | 'created' | 'pushed' | 'full_name') => void;
  setTypeFilter: (type: 'all' | 'owner' | 'public' | 'private' | 'member') => void;
  setLanguageFilter: (language: string) => void;

  // Pagination
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;

  // Utility
  clearError: () => void;
  reset: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;

  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
}

export const useGitHubStore = create<GitHubState>()(
  persist(
    (set, get) => ({
      // Initial state
      repositories: [],
      profile: null,
      currentPage: 1,
      perPage: 30,
      totalRepos: 0,
      hasNextPage: false,
      searchQuery: '',
      sortBy: 'updated',
      typeFilter: 'all',
      languageFilter: '',
      isLoading: false,
      isLoadingProfile: false,
      isSyncing: false,
      error: null,

      // Fetch repositories
      fetchRepositories: async (refresh = false) => {
        const state = get();

        if (state.isLoading && !refresh) return;

        set({ isLoading: true, error: null });

        try {
          const response: ReposResponse = await githubApi.getRepos({
            page: state.currentPage,
            per_page: state.perPage,
            sort: state.sortBy,
            type: state.typeFilter,
            search: state.searchQuery,
          });

          const transformedRepos: GitHubRepository[] = response.repos.map(repo => ({
            ...repo,
            visibility: repo.private ? 'private' : 'public',
            lastUpdatedRelative: getRelativeTime(repo.updated_at),
          }));

          set({
            repositories: transformedRepos,
            totalRepos: response.pagination.total,
            hasNextPage: response.pagination.has_next,
            isLoading: false,
          });
        } catch (error: any) {
          console.error('Failed to fetch repositories:', error);
          set({
            error: error.message || 'Failed to fetch repositories',
            isLoading: false,
            repositories: [],
          });
        }
      },

      // Fetch GitHub profile
      fetchProfile: async () => {
        set({ isLoadingProfile: true, error: null });

        try {
          const data = await githubApi.getProfile();
          set({
            profile: data.profile,
            isLoadingProfile: false,
          });
        } catch (error: any) {
          console.error('Failed to fetch GitHub profile:', error);
          set({
            error: error.message || 'Failed to fetch GitHub profile',
            isLoadingProfile: false,
          });
        }
      },

      // Sync GitHub profile
      syncProfile: async () => {
        set({ isSyncing: true, error: null });

        try {
          await githubApi.sync();
          await get().fetchProfile();
          set({ isSyncing: false });
        } catch (error: any) {
          console.error('Failed to sync GitHub profile:', error);
          set({
            error: error.message || 'Failed to sync GitHub profile',
            isSyncing: false,
          });
        }
      },

      // Disconnect GitHub
      disconnectGitHub: async () => {
        try {
          await githubApi.disconnect();
          get().reset();
        } catch (error: any) {
          console.error('Failed to disconnect GitHub:', error);
          set({
            error: error.message || 'Failed to disconnect GitHub',
          });
          throw error;
        }
      },

      // Filter actions
      setSearchQuery: (query: string) => {
        set({ searchQuery: query, currentPage: 1 });
        get().fetchRepositories();
      },

      setSortBy: (sort) => {
        set({ sortBy: sort, currentPage: 1 });
        get().fetchRepositories();
      },

      setTypeFilter: (type) => {
        set({ typeFilter: type, currentPage: 1 });
        get().fetchRepositories();
      },

      setLanguageFilter: (language: string) => {
        set({ languageFilter: language, currentPage: 1 });
      },

      // Pagination actions
      setPage: (page: number) => {
        set({ currentPage: page });
        get().fetchRepositories();
      },

      nextPage: () => {
        const state = get();
        if (state.hasNextPage) {
          set({ currentPage: state.currentPage + 1 });
          get().fetchRepositories();
        }
      },

      prevPage: () => {
        const state = get();
        if (state.currentPage > 1) {
          set({ currentPage: state.currentPage - 1 });
          get().fetchRepositories();
        }
      },

      // Utility
      clearError: () => set({ error: null }),

      reset: () => set({
        repositories: [],
        profile: null,
        currentPage: 1,
        totalRepos: 0,
        hasNextPage: false,
        searchQuery: '',
        sortBy: 'updated',
        typeFilter: 'all',
        languageFilter: '',
        error: null,
      }),
    }),
    {
      name: 'github-storage',
      partialize: (state) => ({
        sortBy: state.sortBy,
        typeFilter: state.typeFilter,
        perPage: state.perPage,
      }),
    }
  )
);
