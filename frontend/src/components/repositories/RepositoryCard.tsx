import { motion } from 'framer-motion';
import {
  GitBranch,
  Star,
  GitFork,
  Lock,
  Globe,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { GitHubRepository } from '@/store/githubStore';

interface RepositoryCardProps {
  repository: GitHubRepository;
  onClick?: () => void;
}

export function RepositoryCard({ repository, onClick }: RepositoryCardProps) {
  const isPrivate = repository.visibility === 'private';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
        onClick={onClick}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Repository name and visibility */}
              <div className="flex items-center gap-2 mb-2">
                <GitBranch className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                  {repository.full_name}
                </h3>
                {isPrivate ? (
                  <Lock className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                ) : (
                  <Globe className="h-4 w-4 text-green-500 flex-shrink-0" />
                )}
              </div>

              {/* Description */}
              {repository.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {repository.description}
                </p>
              )}

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {repository.language && (
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-primary"></span>
                    <span>{repository.language}</span>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  <span>{repository.stargazers_count.toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-1">
                  <GitFork className="h-4 w-4" />
                  <span>{repository.forks_count.toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Updated {repository.lastUpdatedRelative}</span>
                </div>
              </div>
            </div>

            {/* External link */}
            <a
              href={repository.html_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <ExternalLink className="h-5 w-5 text-muted-foreground hover:text-primary" />
            </a>
          </div>

          {/* Visibility badge */}
          <div className="mt-4 pt-4 border-t flex items-center gap-2">
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                isPrivate
                  ? 'bg-yellow-500/10 text-yellow-500'
                  : 'bg-green-500/10 text-green-500'
              }`}
            >
              {isPrivate ? 'Private' : 'Public'}
            </span>
            {repository.default_branch && (
              <span className="px-2 py-1 rounded text-xs font-medium bg-muted text-muted-foreground">
                {repository.default_branch}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
