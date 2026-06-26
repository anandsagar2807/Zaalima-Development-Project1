import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cleanupAuthDataSync } from '@/lib/auth-cleanup';

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

// Use same-origin API routes (Vercel serverless functions) for all auth calls.
// These routes proxy to the Render backend, forwarding cookies automatically.
// This avoids cross-origin (third-party) cookie issues where browsers block
// cookies set on the Render domain from being read by the Vercel frontend.
// In local dev (no Vercel), fall back to direct backend calls.
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const isLocalDev = API_URL.startsWith('http://localhost') || API_URL.startsWith('http://127.0.0.1');
// Same-origin base for Vercel API routes (relative path, resolved by browser)
const PROXY_BASE = isLocalDev ? API_URL : '';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      githubProfile: null,
      // Start in loading state so consumers (e.g. dashboard page) wait for the
      // initial checkSession() call before deciding to redirect unauthenticated users.
      // Without this, a new user landing on /dashboard after OAuth gets redirected
      // to home before the JWT cookie session can be verified.
      loading: true,
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
          const response = await fetch(`${PROXY_BASE}/api/dashboard`, {
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
        // Redirect the current tab to the backend GitHub OAuth flow
        // The backend handles state generation, cookie setting, and GitHub redirect
        window.location.href = "/api/connect-github";
      },

      logout: async () => {
        try {
          // Call backend to clear server-side session/cookies
          await fetch(`${PROXY_BASE}/api/sign-out`, {
            method: 'POST',
            credentials: 'include',
          });
        } catch (error) {
          console.error('Logout backend call failed:', error);
          // Continue with local cleanup even if backend call fails
        }

        // Reset Zustand state to initial values
        set({
          user: null,
          githubProfile: null,
          authenticated: false,
          githubConnected: false,
          loading: false,
        });

        // Clear all persisted auth data from browser storage
        // This is critical to prevent auto-login after browser reopen
        cleanupAuthDataSync();
      },

      disconnectGithub: async () => {
        try {
          // Use the dedicated GitHub disconnect endpoint (POST /api/github/disconnect)
          // which clears the user's GitHub connection data server-side.
          const response = await fetch(`${PROXY_BASE}/api/github/disconnect`, {
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
          // The backend root /api/dashboard returns { user: {...} } where the
          // user object embeds the GitHub profile fields. We map those into the
          // GitHubProfile shape expected by the UI.
          const response = await fetch(`${PROXY_BASE}/api/dashboard`, {
            credentials: 'include',
          });

          if (response.ok) {
            const data = await response.json();
            const user = data.user;
            if (user && user.githubConnected) {
              get().setGithubProfile({
                id: 0,
                login: user.githubUsername || '',
                name: user.name || user.githubUsername || '',
                avatar_url: user.githubAvatar || user.avatar || '',
                html_url: user.githubProfileUrl || '',
                bio: '',
                public_repos: user.githubPublicRepos || 0,
                followers: user.githubFollowers || 0,
                following: user.githubFollowing || 0,
                created_at: user.githubConnectedAt || '',
                updated_at: user.githubConnectedAt || '',
              });
            } else {
              get().setGithubProfile(null);
            }
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
          // Use the dedicated GitHub sync endpoint (POST /api/github/sync)
          // which refreshes the user's GitHub profile data from the GitHub API.
          const response = await fetch(`${PROXY_BASE}/api/github/sync`, {
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
        githubConnected: state.authenticated ? state.githubConnected : false,
      }),
      merge: (persisted: unknown, current: AuthState): AuthState => {
        const stored = persisted as Partial<AuthState>
        // Never trust localStorage for githubConnected — the server (checkSession)
        // is the sole source of truth. Default to false on every hydration.
        return {
          ...current,
          ...stored,
          githubConnected: false,
        }
      },
    }
  )
);
