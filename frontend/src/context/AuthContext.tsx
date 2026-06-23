import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { cleanupAuthData } from '@/lib/auth-cleanup'

interface User {
  id: string
  email: string
  name?: string
  imageUrl?: string
  hasGitHub?: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isSignedIn: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  checkSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  const checkSession = async () => {
    try {
      // Check if user session exists via backend API
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Session check failed:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkSession()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        navigate('/dashboard')
      } else {
        throw new Error('Sign in failed')
      }
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      // Call backend sign-out to invalidate server-side session
      await fetch('/api/sign-out', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Sign out backend call failed:', error)
      // Continue with local cleanup even if backend call fails
    }

    // Clear React state
    setUser(null)

    // Comprehensive cleanup of all persisted auth data
    // This clears localStorage, sessionStorage, cookies, and IndexedDB
    await cleanupAuthData()

    // Navigate to home page
    navigate('/')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isSignedIn: !!user,
        signIn,
        signOut,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook for user data
export function useUser() {
  const { user, isLoading } = useAuth()
  return { user, isLoaded: !isLoading }
}
