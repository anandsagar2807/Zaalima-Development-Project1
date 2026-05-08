import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, AlertCircle, GitBranch } from 'lucide-react';
import { useGitHubStore } from '@/store/githubStore';
import { RepositoryCard } from './RepositoryCard';
import { RepositoryFilters } from './RepositoryFilters';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

export function RepositoryList() {
  const {
    repositories,
    isLoading,
    error,
    currentPage,
    hasNextPage,
    totalRepos,
    fetchRepositories,
    nextPage,
    prevPage,
    clearError,
  } = useGitHubStore();

  useEffect(() => {
    fetchRepositories();
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleRefresh = () => {
    fetchRepositories(true);
    toast.success('Repositories refreshed');
  };

  // Loading skeleton
  if (isLoading && repositories.length === 0) {
    return (
      <div className="space-y-6">
        <RepositoryFilters />
        <div className="grid gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-6 bg-muted rounded w-2/3"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-4/5"></div>
                  <div className="flex gap-4 mt-4">
                    <div className="h-4 bg-muted rounded w-20"></div>
                    <div className="h-4 bg-muted rounded w-20"></div>
                    <div className="h-4 bg-muted rounded w-32"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && repositories.length === 0) {
    return (
      <div className="space-y-6">
        <RepositoryFilters />
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load repositories</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state
  if (!isLoading && repositories.length === 0) {
    return (
      <div className="space-y-6">
        <RepositoryFilters />
        <Card>
          <CardContent className="p-12 text-center">
            <GitBranch className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No repositories found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or filters
            </p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            >
              Refresh
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Repositories</h1>
          <p className="text-muted-foreground mt-1">
            {totalRepos.toLocaleString()} repositories found
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium">Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <RepositoryFilters />

      {/* Repository grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4"
      >
        {repositories.map((repo) => (
          <RepositoryCard key={repo.id} repository={repo} />
        ))}
      </motion.div>

      {/* Pagination */}
      {(currentPage > 1 || hasNextPage) && (
        <div className="flex items-center justify-center gap-4 pt-6">
          <button
            onClick={prevPage}
            disabled={currentPage === 1 || isLoading}
            className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage}
          </span>
          <button
            onClick={nextPage}
            disabled={!hasNextPage || isLoading}
            className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
