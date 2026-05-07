import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { githubApi } from '../../services/githubApi';
import { toast } from 'sonner';
import {
  Github,
  ExternalLink,
  Users,
  GitFork,
  Calendar,
  RefreshCw,
  Unlink,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { AuthorizeGithubButton } from '../../components/AuthorizeGithubButton';

export function IntegrationsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, githubProfile, fetchGithubProfile, disconnectGithub, syncGithubProfile } =
    useAuthStore();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    // Check for OAuth callback status
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success === 'true') {
      toast.success('GitHub account connected successfully!');
      // Remove query params
      navigate('/dashboard/integrations', { replace: true });
      // Fetch profile
      if (user?.githubConnected) {
        fetchGithubProfile().catch(() => {
          toast.error('Failed to fetch GitHub profile');
        });
      }
    } else if (error) {
      const errorMessages: Record<string, string> = {
        invalid_state: 'Invalid authorization state. Please try again.',
        no_code: 'Authorization code not received.',
        token_exchange_failed: 'Failed to exchange authorization code.',
        profile_fetch_failed: 'Failed to fetch GitHub profile.',
        no_email: 'No email found in GitHub account.',
        account_already_linked: 'This GitHub account is already linked to another user.',
        callback_failed: 'Authorization callback failed.',
      };
      toast.error(errorMessages[error] || 'GitHub authorization failed');
      navigate('/dashboard/integrations', { replace: true });
    }
  }, [searchParams, navigate, user, fetchGithubProfile]);

  useEffect(() => {
    if (user?.githubConnected && !githubProfile) {
      fetchGithubProfile().catch(() => {
        // Silent fail
      });
    }
  }, [user, githubProfile, fetchGithubProfile]);

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your GitHub account?')) {
      return;
    }

    try {
      setLoading(true);
      await disconnectGithub();
      toast.success('GitHub account disconnected');
    } catch (error) {
      toast.error('Failed to disconnect GitHub account');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      await syncGithubProfile();
      toast.success('GitHub profile synced successfully');
    } catch (error) {
      toast.error('Failed to sync GitHub profile');
    } finally {
      setSyncing(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Integrations</h1>
          <p className="text-gray-400">Connect your GitHub account to get started</p>
        </div>

        {/* GitHub Integration Card */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 shadow-xl">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                <Github className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">GitHub</h2>
                <p className="text-sm text-gray-400">Connect your GitHub repositories</p>
              </div>
            </div>
            {user?.githubConnected && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-500 font-medium">Connected</span>
              </div>
            )}
          </div>

          {!user?.githubConnected ? (
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <h3 className="text-sm font-medium text-white mb-2">Why connect GitHub?</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>Automated PR reviews with AI-powered insights</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>Real-time code quality analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>Security vulnerability detection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>Repository insights and analytics</span>
                  </li>
                </ul>
              </div>
              <AuthorizeGithubButton size="lg" className="w-full" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Card */}
              {githubProfile ? (
                <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700">
                  <div className="flex items-start gap-4">
                    <img
                      src={githubProfile.avatar_url}
                      alt={githubProfile.name}
                      className="w-16 h-16 rounded-full border-2 border-gray-700"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-white">
                          {githubProfile.name}
                        </h3>
                        <a
                          href={githubProfile.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">@{githubProfile.login}</p>
                      {githubProfile.bio && (
                        <p className="text-sm text-gray-300 mb-3">{githubProfile.bio}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <GitFork className="w-4 h-4" />
                          <span>{githubProfile.public_repos} repositories</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Users className="w-4 h-4" />
                          <span>{githubProfile.followers} followers</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Users className="w-4 h-4" />
                          <span>{githubProfile.following} following</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                </div>
              )}

              {/* Connection Info */}
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>Connected on {formatDate(user.githubConnectedAt)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleSync}
                  disabled={syncing || loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                  <span>{syncing ? 'Syncing...' : 'Sync Data'}</span>
                </button>
                <button
                  onClick={() => navigate('/dashboard/repositories')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <GitFork className="w-4 h-4" />
                  <span>View Repositories</span>
                </button>
                <button
                  onClick={handleDisconnect}
                  disabled={loading || syncing}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Unlink className="w-4 h-4" />
                  <span>Disconnect</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
