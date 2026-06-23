import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/context/AuthContext'
import { GitHubConnectModal } from '@/components/auth/github-connect-modal'
import AppRoutes from '@/routes'
import { Toaster } from 'sonner'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

function App() {
  const { checkSession } = useAuthStore()

  useEffect(() => {
    // Check session on app load
    checkSession()
  }, [checkSession])

  return (
    <BrowserRouter>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        <AuthProvider>
          <GitHubConnectModal />
          <AppRoutes />
          <Toaster position="top-right" richColors closeButton />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
