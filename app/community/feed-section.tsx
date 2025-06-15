"use client"

import { useFeedData } from "@/hooks/use-feed-data"
import { FeedSection as HomeFeedSection } from "@/components/home/feed-section"

export default function CommunityFeedSection() {
  const {
    posts,
    filteredPosts,
    activeFilters,
    setActiveFilters,
    loading: feedLoading,
    hasMore,
    loadMorePosts
  } = useFeedData()

  // Create missing functions that were in the original component
  const refreshFeed = () => {
    // Refresh logic would go here
    console.log("Refreshing community feed...")
    // Reload posts by resetting page and loading fresh data
    window.location.reload()
  }

  const handleFilterChange = (filters: string[]) => {
    setActiveFilters(filters)
  }

  return (
    <HomeFeedSection
      posts={posts}
      filteredPosts={filteredPosts}
      loading={feedLoading}
      hasMore={hasMore}
      activeFilters={activeFilters}
      newPostAdded={false}
      onLoadMore={loadMorePosts}
      onRefresh={refreshFeed}
      onFilterChange={handleFilterChange}
    />
  )
}
