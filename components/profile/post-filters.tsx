"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface PostFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  activeFilter: string
  onFilterChange: (filter: string) => void
  filteredPostsCount: number
  totalPostsCount: number
  isLoading?: boolean
}

export function PostFilters({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  filteredPostsCount,
  totalPostsCount,
  isLoading = false
}: PostFiltersProps) {
  const filters = ['All', 'With AI', 'Videos', 'Images', 'Text Only']

  return (
    <div className="mb-6 space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-white/20 dark:border-gray-700/20"
        />
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              activeFilter === filter
                ? 'bg-gradient-to-r from-neo-mint to-purist-blue text-white'
                : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Posts Count Display */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <span>
            Showing {filteredPostsCount} of {totalPostsCount} posts
          </span>
        </div>
      </div>
    </div>
  )
}
