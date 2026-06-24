import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, LayoutDashboard } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { SocialAuthButtons } from '@/components/auth/social-auth-buttons'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'

const navItems = [
  { name: 'Features', href: '#features' },
  { name: 'How it Works', href: '#how-it-works' },
  { name: 'Pricing', href: '#pricing' },
]

const dashboardNavItems = [
  { name: 'Overview', href: '/dashboard' },
  { name: 'Repositories', href: '/dashboard/repositories' },
  { name: 'Professional GitHub', href: '/connect-github' },
  { name: 'Settings', href: '/dashboard/settings' },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const { isSignedIn, signOut, user } = useAuth()
  const isDashboardRoute = location.pathname?.startsWith('/dashboard')
  const activeNavItems = isDashboardRoute ? dashboardNavItems : navItems
  const isHomePage = !isDashboardRoute

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link to="/" className="flex items-center space-x-2 shrink-0">
            <div className="relative flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center overflow-hidden rounded-lg shadow-lg ring-1 ring-border/60">
              <img
                src="/owl-logo.png"
                alt="GitGuard owl logo"
                className="h-8 w-8 sm:h-10 sm:w-10 object-cover"
              />
            </div>
            <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
              GitGuard AI
            </span>
          </Link>

          <div className="hidden md:flex items-center justify-center gap-6">
            {activeNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1 sm:gap-3">
            <ThemeToggle />
            <div className="hidden md:flex items-center gap-2 sm:gap-3">
              {isSignedIn ? (
                <>
                  <Link to="/dashboard">
                    <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                      <LayoutDashboard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" className="text-xs sm:text-sm" onClick={signOut}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <SocialAuthButtons size="sm" />
                </>
              )}
            </div>
            <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-background"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              {activeNavItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t">
                {isSignedIn ? (
                  <>
                    <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="w-full gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                    <Button variant="ghost" className="w-full" onClick={signOut}>
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <SocialAuthButtons fullWidth />
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
