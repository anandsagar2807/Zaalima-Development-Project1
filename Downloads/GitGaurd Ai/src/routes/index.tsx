import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import MainLayout from '@/layouts/MainLayout'
import DashboardLayout from '@/layouts/DashboardLayout'

// Pages
import HomePage from '@/pages/HomePage'
import SignInPage from '@/pages/SignInPage'
import ConnectGitHubPage from '@/pages/ConnectGitHubPage'
import GitHubConnectedPage from '@/pages/GitHubConnectedPage'
import NotFoundPage from '@/pages/NotFoundPage'

// Dashboard Pages
import DashboardOverview from '@/pages/dashboard/DashboardOverview'
import { IntegrationsPage } from '@/pages/dashboard/IntegrationsPage'
import { RepositoriesPage } from '@/pages/dashboard/RepositoriesPage'
import PullRequestsPage from '@/pages/dashboard/PullRequestsPage'
import AIReviewsPage from '@/pages/dashboard/AIReviewsPage'
import ReviewHistoryPage from '@/pages/dashboard/ReviewHistoryPage'
import SecurityPage from '@/pages/dashboard/SecurityPage'
import PerformancePage from '@/pages/dashboard/PerformancePage'
import RulesPage from '@/pages/dashboard/RulesPage'
import WebhooksPage from '@/pages/dashboard/WebhooksPage'
import SettingsPage from '@/pages/dashboard/SettingsPage'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/connect-github" element={<ConnectGitHubPage />} />
        <Route path="/github-connected" element={<GitHubConnectedPage />} />
      </Route>

      {/* Protected Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardOverview />} />
        <Route path="integrations" element={<IntegrationsPage />} />
        <Route path="repositories" element={<RepositoriesPage />} />
        <Route path="pull-requests" element={<PullRequestsPage />} />
        <Route path="ai-reviews" element={<AIReviewsPage />} />
        <Route path="review-history" element={<ReviewHistoryPage />} />
        <Route path="security" element={<SecurityPage />} />
        <Route path="performance" element={<PerformancePage />} />
        <Route path="rules" element={<RulesPage />} />
        <Route path="webhooks" element={<WebhooksPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
