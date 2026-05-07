import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const { user, loading, authenticated, githubConnected, checkSession } = useAuthStore();

  useEffect(() => {
    if (!authenticated && !loading) {
      checkSession();
    }
  }, [authenticated, loading, checkSession]);

  return {
    user,
    loading,
    authenticated,
    githubConnected,
  };
}
