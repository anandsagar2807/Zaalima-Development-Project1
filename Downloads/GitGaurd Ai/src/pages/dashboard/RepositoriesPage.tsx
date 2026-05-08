import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Github, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useAuthStore } from '@/store/authStore'
import { RepositoryList } from '@/components/repositories/RepositoryList'
import { AuthorizeGitHubButton } from '@/components/AuthorizeGithubButton'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function RepositoriesPage() {
  const navigate = useNavigate()
  const { user, githubConnected, checkSession } = useAuthStore()

  useEffect(() => {
    checkSession()
  }, [])

  // Show GitHub connection prompt if not connected
  if (!githubConnected) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants}>
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-12 text-center">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
                  <div className="relative bg-primary/10 p-6 rounded-full">
                    <Github className="h-16 w-16 text-primary" />
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-3">Connect Your GitHub Account</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Connect your GitHub account to view and manage your repositories with AI-powered
                code reviews and security scanning
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <AuthorizeGitHubButton size="lg" />
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4">
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Real-time Sync</h3>
                <p className="text-sm text-muted-foreground">
                  Automatically fetch and sync all your repositories from GitHub
                </p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">AI Code Reviews</h3>
                <p className="text-sm text-muted-foreground">
                  Get intelligent code reviews powered by advanced AI models
                </p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Security Scanning</h3>
                <p className="text-sm text-muted-foreground">
                  Detect vulnerabilities and security issues automatically
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  // Show repositories list if connected
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <RepositoryList />
    </motion.div>
  )
}
