import { useState } from 'react';
import { Github, Loader2, ExternalLink } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { cn } from '../lib/utils';

interface AuthorizeGithubButtonProps {
  className?: string;
  variant?: 'default' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  /** Always show "Authorize GitHub" label, even if GitHub is connected */
  forceAuthorize?: boolean;
  /** If true, clicking will open the GitHub OAuth flow directly (skips connect-github page) */
  skipConnectPage?: boolean;
}

export default function AuthorizeGithubButton({
  className,
  variant = 'default',
  size = 'md',
  forceAuthorize = false,
  skipConnectPage = false,
}: AuthorizeGithubButtonProps) {
  const { githubConnected, connectGithub } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = () => {
    setIsLoading(true);
    connectGithub();
  };

  const showConnected = githubConnected && !forceAuthorize;
  const showDisabled = showConnected || isLoading;

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variantClasses = {
    default:
      'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border border-green-600',
    outline:
      'bg-transparent hover:bg-green-900/50 text-green-100 border border-green-700 hover:border-green-600',
  };

  return (
    <button
      onClick={handleConnect}
      disabled={showDisabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'hover:scale-[1.02] active:scale-[0.98]',
        'shadow-lg hover:shadow-xl',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : showConnected ? (
        <Github className="w-5 h-5" />
      ) : (
        <ExternalLink className="w-5 h-5" />
      )}
      <span>
        {showConnected
          ? 'GitHub Connected'
          : isLoading
            ? 'Connecting...'
            : 'Authorize GitHub'}
      </span>
    </button>
  );
}

export { AuthorizeGithubButton };

export function AuthorizeGitHubButton(props: AuthorizeGithubButtonProps) {
  return <AuthorizeGithubButton {...props} />;
}
