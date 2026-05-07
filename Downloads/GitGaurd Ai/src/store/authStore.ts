import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  githubConnected: boolean;
  githubUsername?: string;
  githubAvatar?: string;
  githubProfileUrl?: string;
  githubPublicRepos?: number;
  githubFollowers?: number;
  githubFollowing?: number;
  githubConnectedAt?: string;
}

interface GitHubProfile {
  id: number;
  login: string;
  name: string;
  avatar_url: string;
  html_url: string;
  bio?: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  githubProfile: GitHubProfile | null;
  loading: boolean;
  authenticated: boolean;
  githubConnected: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setGithubProfile: (profile: GitHubProfile | null) => void;
  setLoading: (loading: boolean) => void;
  checkSession: () => Promise<void>;
  connectGithub: () => void;
  logout: () => Promise<void>;
  disconnectGithub: () => Promise<void>;
  fetchGithubProfile: () => Promise<void>;
  syncGithubProfile: () => Promise<void>;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      githubProfile: null,
      loading: false,
      authenticated: false,
      githubConnected: false,

      setUser: (user) =>
        set({
          user,
          authenticated: !!user,
          githubConnected: user?.githubConnected || false,
        }),

      setGithubProfile: (profile) => set({ githubProfile: profile }),

      setLoading: (loading) => set({ loading }),

      checkSession: async () => {
        try {
          set({ loading: true });
          const response = await fetch(`${API_URL}/api/auth/me`, {
            credentials: 'include',
          });

          if (response.ok) {
            const data = await response.json();
            get().setUser(data.user);
          } else {
            get().setUser(null);
          }
        } catch (error) {
          console.error('Session check failed:', error);
          get().setUser(null);
        } finally {
          set({ loading: false });
        }
      },

      connectGithub: () => {
        window.location.href = `${API_URL}/auth/github`;
      },

      logout: async () => {
        try {
          await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
          });
          get().setUser(null);
          get().setGithubProfile(null);
        } catch (error) {
          console.error('Logout failed:', error);
        }
      },

      disconnectGithub: async () => {
        try {
          const response = await fetch(`${API_URL}/api/github/disconnect`, {
            method: 'POST',
            credentials: 'include',
          });

          if (response.ok) {
            const currentUser = get().user;
            if (currentUser) {
              get().setUser({
                ...currentUser,
                githubConnected: false,
                githubUsername: undefined,
                githubAvatar: undefined,
                githubProfileUrl: undefined,
                githubPublicRepos: 0,
                githubFollowers: 0,
                githubFollowing: 0,
                githubConnectedAt: undefined,
              });
            }
            get().setGithubProfile(null);
          }
        } catch (error) {
          console.error('Disconnect GitHub failed:', error);
          throw error;
        }
      },

      fetchGithubProfile: async () => {
        try {
          set({ loading: true });
          const response = await fetch(`${API_URL}/api/github/profile`, {
            credentials: 'include',
          });

          if (response.ok) {
            const data = await response.json();
            get().setGithubProfile(data.profile);
          } else {
            throw new Error('Failed to fetch GitHub profile');
          }
        } catch (error) {
          console.error('Fetch GitHub profile failed:', error);
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      syncGithubProfile: async () => {
        try {
          set({ loading: true });
          const response = await fetch(`${API_URL}/api/github/sync`, {
            method: 'POST',
            credentials: 'include',
          });

          if (response.ok) {
            await get().checkSession();
            await get().fetchGithubProfile();
          } else {
            throw new Error('Failed to sync GitHub profile');
          }
        } catch (error) {
          console.error('Sync GitHub profile failed:', error);
          throw error;
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        authenticated: state.authenticated,
        githubConnected: state.githubConnected,
      }),
    }
  )
);
