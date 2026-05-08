import { useEffect } from 'react';
import { Github, LogOut, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { useGitHubStore } from '@/store/githubStore';
import { AuthorizeGitHubButton } from '@/components/AuthorizeGithubButton';
import { toast } from 'sonner';

export default function IntegrationsPage() {
  const { user, githubConnected, disconnectGithub } = useAuthStore();
  const { profile, isLoadingProfile, isSyncing, fetchProfile, syncProfile } = useGitHubStore();

  useEffect(() => {
    if (githubConnected) {
      fetchProfile();
    }
  }, [githubConnected]);

  const handleDisconnect = async () => {
    if (confirm('Are you sure you want to disconnect your GitHub account?')) {
      try {
        await disconnectGithub();
        toast.success('GitHub account disconnected');
      } catch (error) {
        toast.error('Failed to disconnect GitHub account');
      }
    }
  };

  const handleSync = async () => {
    try {
      await syncProfile();
      toast.success('GitHub profile synced successfully');
    } catch (error) {
      toast.error('Failed to sync GitHub profile');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground mt-1">
          Connect and manage your external integrations
        </p>
      </div>

      {/* GitHub Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            GitHub
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!githubConnected ? (
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Connect your GitHub account to enable AI-powered code reviews, security scanning,
                and repository management.
              </p>
              <AuthorizeGitHubButton />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Connection Status */}
              <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center gap-3">
                  {user?.githubAvatar && (
                    <img
                      src={user.githubAvatar}
                      alt={user.githubUsername}
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-medium">{user?.githubUsername}</p>
                    <p className="text-sm text-muted-foreground">Connected to GitHub</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    Sync
                  </button>
                  <button
                    onClick={handleDisconnect}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors text-sm"
                  >
                    <LogOut className="h-4 w-4" />
                    Disconnect
                  </button>
                </div>
              </div>

              {/* Profile Stats */}
              {profile && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">{profile.public_repos}</p>
                    <p className="text-sm text-muted-foreground">Repositories</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">{profile.followers}</p>
                    <p className="text-sm text-muted-foreground">Followers</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">{profile.following}</p>
                    <p className="text-sm text-muted-foreground">Following</p>
                  </div>
                </div>
              )}

              {/* Profile Info */}
              {profile && (
                <div className="space-y-2 text-sm">
                  {profile.name && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{profile.name}</span>
                    </div>
                  )}
                  {profile.bio && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bio:</span>
                      <span className="font-medium text-right max-w-xs">{profile.bio}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Profile:</span>
                    <a
                      href={profile.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline"
                    >
                      View on GitHub
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Coming Soon */}
      <Card className="opacity-60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            More Integrations Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            We're working on adding more integrations like GitLab, Bitbucket, Slack, and more.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
