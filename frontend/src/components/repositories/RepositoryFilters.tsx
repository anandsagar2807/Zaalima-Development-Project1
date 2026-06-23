import { Search, SlidersHorizontal } from 'lucide-react';
import { useGitHubStore } from '@/store/githubStore';

export function RepositoryFilters() {
  const {
    searchQuery,
    sortBy,
    typeFilter,
    setSearchQuery,
    setSortBy,
    setTypeFilter,
  } = useGitHubStore();

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search repositories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Sort */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="updated">Last updated</option>
            <option value="created">Recently created</option>
            <option value="pushed">Recently pushed</option>
            <option value="full_name">Name</option>
          </select>
        </div>

        {/* Type filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
          className="px-3 py-1.5 rounded-lg bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="all">All repositories</option>
          <option value="owner">Owner</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
          <option value="member">Member</option>
        </select>
      </div>
    </div>
  );
}
